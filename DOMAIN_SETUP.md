# Domain Configuration for aqarbay.com

Complete DNS and domain setup guide for deploying AqarBay on Dokploy.

---

## 📌 Overview

Your AqarBay platform uses **4 subdomains** plus the main domain:

| Domain | Purpose | Port | Service |
|--------|---------|------|---------|
| **aqarbay.com** | Main website (frontend) | 3000 | Next.js web app |
| **www.aqarbay.com** | WWW redirect | 3000 | Next.js web app |
| **api.aqarbay.com** | Backend API | 8000 | FastAPI |
| **s3.aqarbay.com** | MinIO S3 storage (images) | 9000 | MinIO |
| **admin.s3.aqarbay.com** | MinIO admin console | 9001 | MinIO Console |

---

## 🌐 DNS Configuration

### Step 1: Get Your Dokploy Server IP

Find your Dokploy server's public IP address. You can get this from:
- Your VPS provider dashboard (DigitalOcean, Linode, AWS, etc.)
- SSH into server and run: `curl ifconfig.me`

**Example IP:** `167.99.123.456` (replace with your actual IP)

### Step 2: Configure DNS Records

Login to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and add these DNS records:

#### A Records (Required)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 300 |
| A | api | YOUR_SERVER_IP | 300 |
| A | s3 | YOUR_SERVER_IP | 300 |
| A | admin.s3 | YOUR_SERVER_IP | 300 |

#### CNAME Records (Optional but Recommended)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | aqarbay.com | 300 |

### Example Configuration

If your server IP is `167.99.123.456`:

```
Type    Name        Value               TTL
----    ----        -----               ---
A       @           167.99.123.456      300
A       api         167.99.123.456      300
A       s3          167.99.123.456      300
A       admin.s3    167.99.123.456      300
CNAME   www         aqarbay.com         300
```

### Step 3: Wait for DNS Propagation

DNS changes can take 5-60 minutes to propagate worldwide. Lower TTL (300 seconds = 5 minutes) speeds this up.

**Check propagation status:**

```bash
# Check main domain
dig aqarbay.com

# Check subdomains
dig api.aqarbay.com
dig s3.aqarbay.com
dig admin.s3.aqarbay.com

# Or use online tools
# https://dnschecker.org
```

You should see your server IP in the results.

---

## 🔧 Dokploy Domain Configuration

Once DNS is propagated, configure domains in Dokploy:

### 1. Main Website (Frontend)

- **Domain:** `aqarbay.com`
- **Service:** `web`
- **Container Port:** `3000`
- **SSL/TLS:** ✅ Enable (Let's Encrypt)
- **Force HTTPS:** ✅ Yes
- **WWW Redirect:** Add `www.aqarbay.com` as alias

### 2. API Backend

- **Domain:** `api.aqarbay.com`
- **Service:** `api`
- **Container Port:** `8000`
- **SSL/TLS:** ✅ Enable (Let's Encrypt)
- **Force HTTPS:** ✅ Yes

### 3. MinIO Storage (S3)

- **Domain:** `s3.aqarbay.com`
- **Service:** `minio`
- **Container Port:** `9000`
- **SSL/TLS:** ✅ Enable (Let's Encrypt)
- **Force HTTPS:** ✅ Yes

### 4. MinIO Admin Console

- **Domain:** `admin.s3.aqarbay.com`
- **Service:** `minio`
- **Container Port:** `9001`
- **SSL/TLS:** ✅ Enable (Let's Encrypt)
- **Force HTTPS:** ✅ Yes

---

## 🔒 SSL/TLS Certificates

Dokploy automatically provisions Let's Encrypt certificates for all domains.

**Requirements:**
1. DNS must be pointing to your server
2. Server must be accessible on ports 80 and 443
3. Firewall must allow HTTP/HTTPS traffic

**Certificate Renewal:**
- Certificates auto-renew every 90 days
- Dokploy handles this automatically
- No action needed from you

---

## ✅ Verification Checklist

After DNS and Dokploy configuration:

- [ ] `aqarbay.com` resolves to your server IP
- [ ] `api.aqarbay.com` resolves to your server IP
- [ ] `s3.aqarbay.com` resolves to your server IP
- [ ] `admin.s3.aqarbay.com` resolves to your server IP
- [ ] `www.aqarbay.com` resolves to your server IP (or redirects)
- [ ] All domains configured in Dokploy
- [ ] SSL certificates issued (green padlock in browser)
- [ ] HTTPS redirect working (HTTP → HTTPS)
- [ ] Website loads at https://aqarbay.com
- [ ] API docs accessible at https://api.aqarbay.com/docs
- [ ] MinIO console accessible at https://admin.s3.aqarbay.com

---

## 🌍 CloudFlare Configuration (Optional)

If you use CloudFlare for DNS and CDN:

### DNS Records (CloudFlare)

Same as above, but set **Proxy status:**

| Domain | Proxy Status | Notes |
|--------|--------------|-------|
| aqarbay.com | ✅ Proxied | CDN + DDoS protection |
| www.aqarbay.com | ✅ Proxied | |
| api.aqarbay.com | ⚠️ DNS Only | API needs direct connection |
| s3.aqarbay.com | ⚠️ DNS Only | MinIO needs direct access |
| admin.s3.aqarbay.com | ⚠️ DNS Only | Admin console needs direct |

**Important:** API and S3 subdomains should be **DNS Only** (grey cloud), not proxied, to avoid CloudFlare interfering with uploads and API requests.

### SSL/TLS Mode

- Set to **Full (Strict)** in CloudFlare SSL settings
- This ensures end-to-end encryption

### Page Rules (Optional)

Create these CloudFlare page rules:

1. **Force HTTPS:**
   - URL: `http://*aqarbay.com/*`
   - Setting: Always Use HTTPS

2. **Cache Static Assets:**
   - URL: `*aqarbay.com/*.jpg`, `*.png`, `*.css`, `*.js`
   - Setting: Cache Level = Cache Everything

---

## 🔧 Troubleshooting

### DNS not resolving?

**Check:**
1. Did you wait 5-10 minutes for propagation?
2. Is the DNS record correct? (Type, Name, Value)
3. Did you save changes in your registrar?

**Fix:**
```bash
# Flush local DNS cache
# macOS:
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

# Linux:
sudo systemd-resolve --flush-caches

# Windows:
ipconfig /flushdns
```

### SSL certificate not issuing?

**Check:**
1. DNS propagated? (use `dig domain.com`)
2. Port 80 open on firewall?
3. Domain correctly configured in Dokploy?
4. No other service using port 80/443?

**Fix:**
- Wait a few minutes and try again
- Check Dokploy logs for certificate errors
- Ensure port 80 is accessible: `curl http://yourserver-ip`

### Website loads but API doesn't?

**Check:**
1. Is `api.aqarbay.com` DNS record correct?
2. Is API service running? (`docker-compose ps api`)
3. Is port 8000 configured in Dokploy?

**Fix:**
```bash
# Check API is accessible
curl http://yourserver-ip:8000/health

# Should return: {"status":"healthy"}
```

### Images not loading?

**Check:**
1. MinIO running? (`docker-compose ps minio`)
2. `s3.aqarbay.com` DNS correct?
3. `MINIO_PUBLIC_URL` env var set to `https://s3.aqarbay.com`?
4. MinIO bucket is public?

**Fix:**
1. Visit https://admin.s3.aqarbay.com
2. Login with `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`
3. Ensure bucket "aqarbay" exists
4. Set bucket access policy to "public"

---

## 📊 DNS Provider Specific Guides

### GoDaddy

1. Login to GoDaddy
2. My Products → DNS
3. Click "Add" for each record
4. Select record type (A or CNAME)
5. Enter Name, Value, TTL
6. Save

### Namecheap

1. Login to Namecheap
2. Domain List → Manage
3. Advanced DNS
4. Add New Record
5. Select Type, Host, Value, TTL
6. Save Changes

### Cloudflare

1. Login to Cloudflare
2. Select your domain
3. DNS → Records
4. Add record
5. Type, Name, Content, Proxy status
6. Save

### Google Domains

1. Login to Google Domains
2. My Domains → Manage
3. DNS → Custom records
4. Add record
5. Type, Host, Data, TTL
6. Save

---

## 🎯 Next Steps

After DNS and domains are configured:

1. ✅ Verify all domains resolve correctly
2. ✅ Deploy application in Dokploy
3. ✅ Wait for SSL certificates to be issued
4. ✅ Run initialization script
5. ✅ Test all domains and services
6. ✅ Add content in admin panel
7. ✅ Launch! 🚀

---

## 📞 Support

If you encounter issues:

- **DNS Issues:** Contact your domain registrar support
- **SSL Issues:** Check Dokploy documentation or logs
- **Application Issues:** See [DOKPLOY_DEPLOYMENT.md](./DOKPLOY_DEPLOYMENT.md)

---

**Domain:** aqarbay.com  
**Last Updated:** January 2026  
**Platform:** Dokploy

