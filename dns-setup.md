# DNS Setup for testingvala.com

## Required DNS Records (Add to your domain registrar):

### 1. DKIM Record
```
Type: TXT
Name: 191798._domainkey
Value: k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... 
(Copy exact value from ZeptoMail dashboard)
TTL: 3600
```

### 2. CNAME Record  
```
Type: CNAME
Name: bounce-zem
Value: cluster89.zeptomail.in
TTL: 3600
```

### 3. SPF Record
```
Type: TXT
Name: @ (root domain)
Value: v=spf1 include:zeptomail.zoho.com ~all
TTL: 3600
```

### 4. DMARC Record (Optional but recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@testingvala.com
TTL: 3600
```

## Steps:
1. Login to your domain registrar (where you bought testingvala.com)
2. Go to DNS Management/DNS Settings
3. Add the above 3-4 records
4. Wait 15-60 minutes for propagation
5. Click "Verify DNS records" in ZeptoMail dashboard
6. Status should change to "Verified"

## Common Domain Registrars:
- **GoDaddy**: DNS Management → Add Record
- **Namecheap**: Advanced DNS → Add New Record  
- **Cloudflare**: DNS → Add Record
- **Google Domains**: DNS → Custom Records