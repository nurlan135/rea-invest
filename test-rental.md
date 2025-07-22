# REA Invest İcarə Funksionallığı Test Ssenarisi

## Test Ediləcək Funksionallıqlar

### 1. Əmlak Əlavə Etmə (İcarə məqsədi ilə)
- URL: http://localhost:3003/properties
- Əməliyyat: "Əmlak Əlavə Et" düyməsini basın
- Təyinat: "İcarə" seçin
- Gözlənilən: İcarə sahələrinin görünməsi
  - Aylıq kirayə (₼)
  - Depozit məbləği (₼) 
  - Mövcudluq tarixi
  - Əşya vəziyyəti
  - Kommunal xərclər

### 2. İcarə Səhifəsi
- URL: http://localhost:3003/leases
- Gözlənilən: İcarə müqavilələri səhifəsinin açılması
- Naviqasiyada "İcarə" bölməsinin görünməsi

### 3. İcarə Müqaviləsi Yaratma
- Şərt: Əvvəlcə icarə məqsədli əmlak olmalıdır
- "Yeni Müqavilə" formu açılmalıdır
- Əmlak seçimi, kirayəçi seçimi və müqavilə şərtləri

### 4. API Endpoints Test
```bash
# İcarə müqavilələrini əldə etmə
curl http://localhost:3003/api/leases

# Əmlakları əldə etmə (icarə məqsədi ilə)
curl "http://localhost:3003/api/properties?purpose=ICARE&status=YENI"
```

## Database Schema Yoxlanışı
Yeni modellər:
- ✅ Lease (İcarə müqaviləsi)
- ✅ RentPayment (Kirayə ödənişi)
- ✅ ContactType.TENANT
- ✅ LeaseStatus enum
- ✅ PaymentStatus enum

## Xəta Həlli
Əgər Prisma xətası çıxarsa:
1. `npm run db:push` - Schema dəyişikliklərini tətbiq et
2. Browser cache-i təmizlə
3. Development server-i yenidən başlat

## İndi Test Edilə Bilər
Development server: http://localhost:3003