package main

import (
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var (
	db            *gorm.DB
	defaultDBPath = getEnv("DB_PATH", "wallet.db")
)


type Account struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	Name      string    `json:"name"`
	Currency  string    `gorm:"size:3" json:"currency"` 
	Balance   int64     `json:"amountCents"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type TxType string

const (
	TxIn  TxType = "IN" 
	TxOut TxType = "OUT" 
)

type Transaction struct {
	ID           uint      `gorm:"primarykey" json:"id"`
	AccountID    uint      `gorm:"index" json:"accountId"`
	Type         TxType    `gorm:"type:text" json:"type"` 
	AmountCents  int64     `json:"amountCents"`          
	Description  string    `json:"description"`
	OccurredAt   time.Time `json:"occurredAt"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}



type AccountReq struct {
	Name     string `json:"name" binding:"required"`
	Currency string `json:"currency" binding:"required,len=3"` 
	Balance  int64  `json:"amountCents"`
}

type TxCreateReq struct {
	AccountID   uint   `json:"accountId" binding:"required"`
	Type        TxType `json:"type" binding:"required,oneof=IN OUT"`
	AmountCents int64  `json:"amountCents" binding:"required"`
	Description string `json:"description"`
	OccurredAt  string `json:"occurredAt"` 
}

type SummaryResp struct {
	AccountID   *uint  `json:"accountId,omitempty"`
	From        string `json:"from"`
	To          string `json:"to"`
	Currency    string `json:"currency"`
	TotalIn     int64  `json:"totalIn"`
	TotalOut    int64  `json:"totalOut"`
	Net         int64  `json:"net"`
	Transactions int   `json:"transactions"`
}

type AccountWithBalance struct {
	Account
	BalanceCents int64 `json:"balanceCents"`
}


type Claims struct {
	UserID uint `json:"uid"`
	jwt.RegisteredClaims
}


func me(c *gin.Context) uint {
	v, _ := c.Get("uid")
	return v.(uint)
}

func main() {
	var err error
	db, err = gorm.Open(sqlite.Open(defaultDBPath), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	if err := db.AutoMigrate(&Account{}, &Transaction{}); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"ok": true}) })


	r.POST("/accounts", handleCreateAccount)
	r.GET("/accounts", handleListAccounts) 
	r.GET("/accounts/:id/transactions", handleListTxByAccount)
	r.POST("/transactions", handleCreateTx)
	r.GET("/reports/summary", handleSummary)

	log.Println("Listening on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}




func handleCreateAccount(c *gin.Context) {
	var req AccountReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	acc := Account{ Name: req.Name, Currency: req.Currency, Balance:req.Balance}
	if err := db.Create(&acc).Error; err != nil {
		c.JSON(500, gin.H{"error": "cannot create account"})
		return
	}
	c.JSON(201, acc)
}

func handleListAccounts(c *gin.Context) {
	var accounts []Account
	if err := db.Order("id desc").Find(&accounts).Error; err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}

	resp := make([]AccountWithBalance, 0, len(accounts))
	for _, a := range accounts {
		var in, out int64
		db.Model(&Transaction{}).Where("account_id = ? AND type = ?", a.ID, TxIn).Select("coalesce(sum(amount_cents),0)").Scan(&in)
		db.Model(&Transaction{}).Where("account_id = ? AND type = ?",  a.ID, TxOut).Select("coalesce(sum(amount_cents),0)").Scan(&out)
		resp = append(resp, AccountWithBalance{Account: a, BalanceCents: in - out})
	}
	c.JSON(200, resp)
}

func handleCreateTx(c *gin.Context) {
	var req TxCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var acc Account
	if err := db.Where("id = ? ", req.AccountID).First(&acc).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "account not found"})
		return
	}
	when := time.Now()
	if req.OccurredAt != "" {
		t, err := time.Parse(time.RFC3339, req.OccurredAt)
		if err != nil {
			c.JSON(400, gin.H{"error": "occurredAt must be RFC3339"})
			return
		}
		when = t
	}
	tx := Transaction{
		AccountID:   req.AccountID,
		Type:        req.Type,
		AmountCents: req.AmountCents,
		Description: req.Description,
		OccurredAt:  when,
	}
	if req.AmountCents <= 0 {
		c.JSON(400, gin.H{"error": "amountCents must be > 0"})
		return
	}
	if err := db.Create(&tx).Error; err != nil {
		c.JSON(500, gin.H{"error": "cannot create transaction"})
		return
	}
	if tx.Type == "OUT" {
		acc.Balance -= tx.AmountCents;
	}
	if tx.Type == "IN" {
		acc.Balance += tx.AmountCents;
	}
	c.JSON(201, tx)
}

func handleListTxByAccount(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.ParseUint(idStr, 10, 64)

	var acc Account
	if err := db.Where("id = ?", id,).First(&acc).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "account not found"})
		return
	}

	limit, _ := strconv.Atoi(getQueryDefault(c, "limit", "50"))
	offset, _ := strconv.Atoi(getQueryDefault(c, "offset", "0"))

	var txs []Transaction
	if err := db.Where("account_id = ?",  id).
		Order("occurred_at desc, id desc").
		Limit(limit).Offset(offset).
		Find(&txs).Error; err != nil {
		c.JSON(500, gin.H{"error": "db error"})
		return
	}
	c.JSON(200, gin.H{"account": acc, "items": txs, "limit": limit, "offset": offset})
}

func handleSummary(c *gin.Context) {
	fromStr := getQueryDefault(c, "from", time.Now().AddDate(0, -1, 0).Format(time.RFC3339))
	toStr := getQueryDefault(c, "to", time.Now().Format(time.RFC3339))
	var (
		from, _ = time.Parse(time.RFC3339, fromStr)
		to, _   = time.Parse(time.RFC3339, toStr)
	)

	var accIDPtr *uint
	if idStr := c.Query("account_id"); idStr != "" {
		idU64, err := strconv.ParseUint(idStr, 10, 64)
		if err != nil {
			c.JSON(400, gin.H{"error": "account_id must be numeric"})
			return
		}
		id := uint(idU64)
		var acc Account
		if err := db.Where("id = ?", id).First(&acc).Error; err != nil {
			c.JSON(403, gin.H{"error": "account not found"})
			return
		}
		accIDPtr = &id

		var in, out int64
		db.Model(&Transaction{}).
			Where("account_id = ? AND type = ? AND occurred_at BETWEEN ? AND ?", id, TxIn, from, to).
			Select("coalesce(sum(amount_cents),0)").Scan(&in)
		db.Model(&Transaction{}).
			Where("account_id = ? AND type = ? AND occurred_at BETWEEN ? AND ?",id, TxOut, from, to).
			Select("coalesce(sum(amount_cents),0)").Scan(&out)

		var count int64
		db.Model(&Transaction{}).
			Where("account_id = ? AND occurred_at BETWEEN ? AND ?", id, from, to).
			Count(&count)

		c.JSON(200, SummaryResp{
			AccountID:   accIDPtr,
			From:        from.Format(time.RFC3339),
			To:          to.Format(time.RFC3339),
			Currency:    acc.Currency,
			TotalIn:     in,
			TotalOut:    out,
			Net:         in - out,
			Transactions: int(count),
		})
		return
	}

	var in, out int64
	db.Model(&Transaction{}).
		Where("type = ? AND occurred_at BETWEEN ? AND ?", TxIn, from, to).
		Select("coalesce(sum(amount_cents),0)").Scan(&in)
	db.Model(&Transaction{}).
		Where("AND type = ? AND occurred_at BETWEEN ? AND ?",TxOut, from, to).
		Select("coalesce(sum(amount_cents),0)").Scan(&out)
	var count int64
	db.Model(&Transaction{}).
		Where("occurred_at BETWEEN ? AND ?",  from, to).
		Count(&count)

	c.JSON(200, SummaryResp{
		From:        from.Format(time.RFC3339),
		To:          to.Format(time.RFC3339),
		Currency:    "MIXED", 
		TotalIn:     in,
		TotalOut:    out,
		Net:         in - out,
		Transactions: int(count),
	})
}


func getQueryDefault(c *gin.Context, key, def string) string {
	v := c.Query(key)
	if v == "" {
		return def
	}
	return v
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}

func isNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
