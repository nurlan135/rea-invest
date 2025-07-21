# Product Requirements Document (PRD): REA Invest

**Version:** 1.0  
**Date:** 21 İyul 2025  
**Author:** AI Analysis Based on Codebase Review  

---

## 1. Ümumi Baxış və Məqsəd (Overview and Purpose)

REA Invest, Azərbaycan əmlak agentlikləri üçün nəzərdə tutulmuş veb-əsaslı bir əmlak idarəetmə sistemidir. Tətbiqin əsas məqsədi əmlakların, müştərilərin, agentlərin və maliyyə əməliyyatlarının mərkəzləşdirilmiş şəkildə idarə olunmasını təmin etmək, hesabatları avtomatlaşdırmaq və şirkətin ümumi fəaliyyətinin səmərəliliyini artırmaqdır.

### Əsas Hədəflər:
- Əmlak portfoliosunun effektiv idarəetməsi
- Müştəri məlumatlarının mərkəzləşdirilməsi
- Maliyyə əməliyyatlarının avtomatlaşdırılması və mənfəətin hesablanması
- Real-time analitika və hesabatlar
- İstifadəçi dostluğu və təhlükəsizlik

---

## 2. Mövcud Funksionallıq və Xüsusiyyətlər

### 2.1 Dashboard (İdarə Paneli)
- **Statistik Kartlar**: Ümumi əmlak sayı, gəlir, mənfəət və digər KPI-lar
- **İnteraktiv Qrafiklər**: Recharts istifadə edərək son 12 ayın performans göstəriciləri
- **Son Fəaliyyətlər**: Yeni əlavə edilən əmlaklar və əməliyyatlar
- **Real-time Yeniləmə**: Avtomatik məlumat sinxronizasiyası

### 2.2 Property Management (Əmlak İdarəetməsi)
- **Əmlak Siyahısı**: Axtarış və filtrləmə funksiyaları (rayon, status, növ, sahə)
- **Yeni Əmlak Əlavə Etmə**: Tam məlumatlarla birlikdə əmlak sahibinin yaradılması
- **Əmlak Redaktəsi**: Mövcud məlumatların yenilənməsi
- **Ətraflı Məlumat Səhifəsi**: Hər əmlak üçün detallı görünüş
- **Status İzləməsi**: YENI, GÖZLƏMƏDƏ, BEH VERİLİB, SATILIB, İCARƏYƏ VERİLİB

### 2.3 Customer Management (Müştəri İdarəetməsi)
- **Müştəri Siyahısı**: OWNER (sahib) və BUYER (alıcı) tipləri
- **Axtarış və Filtrləmə**: Ad, telefon, tip üzrə axtarış
- **Yeni Müştəri Əlavə Etmə**: Tam məlumat forması
- **Müştəri Profili**: Sahib olduğu və aldığı əmlakların tarixçəsi

### 2.4 Agent Management (Agent İdarəetməsi)
- **Agent Siyahısı**: Sistemdə qeydiyyatlı bütün istifadəçilər
- **Performans Statistikaları**: Hər agent üçün əmlak və əməliyyat sayı
- **Rol İdarəetməsi**: ADMIN və AGENT rolları

### 2.5 Transaction Management (Əməliyyat İdarəetməsi)
- **Əməliyyat Siyahısı**: Bütün maliyyə əməliyyatları
- **Yeni Əməliyyat Yaratma**: Alış, xərclər, satış məlumatları
- **Avtomatik Mənfəət Hesablanması**: Real-time mənfəət kalkulyasiyası
- **Deposit İzləməsi**: Beh məlumatları və müddət takibi

### 2.6 Authentication & Session Management
- **Təhlükəsiz Giriş**: Email və şifrə ilə autentifikasiya
- **Sessiya İdarəetməsi**: 30 dəqiqəlik avtomatik çıxış
- **Xəbərdarlıq Sistemi**: 5 dəqiqə qalmasından xəbərdarlıq
- **Avtomatik Çıxış**: Fəaliyyətsizlik halında təhlükəsiz çıxış

### 2.7 Reporting & Export
- **Excel Export**: Əmlak və əməliyyat məlumatlarını ixrac
- **Məlumat Filtrləməsi**: Ixrac ediləcək məlumatları seçmə
- **Formatlaşdırılmış Hesabatlar**: İşə hazır Excel cədvəlləri

---

## 3. İstifadəçi Rolları və İcazələr

### 3.1 ADMIN Rolu
- **Sistem İdarəetməsi**: Bütün sistem üzərində tam nəzarət
- **İstifadəçi İdarəetməsi**: Agent hesabları yaratma/silmə
- **Sistem Konfiqurasiyası**: Parametrlərin dəyişdirilməsi
- **Tam Məlumat Giriş**: Bütün məlumatlara giriş icazəsi

### 3.2 AGENT Rolu  
- **Əmlak İdarəetməsi**: Öz əmlakları və müştərilərini idarə etmə
- **Əməliyyat Yaratma**: Yalnız öz adına əməliyyat yaratma
- **Hesabat Görüntüləmə**: Öz fəaliyyətinə aid hesabatlar
- **Məhdud Sistem Giriş**: Yalnız təyin edilən funksiyalara giriş

### 3.3 Təhlükəsizlik Tədbirləri
- **Middleware Qorunması**: Bütün qorunan marşrutlar
- **JWT Token Sistemi**: Təhlükəsiz sessiya idarəetməsi
- **API Endpoint Qorunması**: Hər API çağırışının autentifikasiyası
- **Avtomatik Çıxış**: Fəaliyyətsizlik zamanı təhlükəsizlik

---

## 4. Verilənlər Bazası Sxemi və Data Modelləri

### 4.1 Əsas Modellər

#### User Model
```typescript
- id: Integer (Primary Key)
- email: String (Unique)
- fullName: String
- password: String (Hashed)
- role: UserRole (ADMIN | AGENT)
- isActive: Boolean
- createdAt, updatedAt: DateTime
```

#### Contact Model  
```typescript
- id: Integer (Primary Key)
- firstName, lastName: String
- fatherName: String (Optional)
- phone: String (Unique)
- address: String (Optional)
- type: ContactType (OWNER | BUYER)
- createdAt, updatedAt: DateTime
```

#### Property Model
```typescript
- id: Integer (Primary Key)
- documentNumber: String (Unique, Auto-generated)
- registrationDate: DateTime
- district, projectName, streetAddress: String
- apartmentNumber: String (Optional)
- roomCount: String
- area: Float
- floor: Integer
- documentType: DocumentType
- repairStatus: RepairStatus
- propertyType: PropertyType
- purpose: PropertyPurpose
- status: PropertyStatus
- ownerId, agentId: Foreign Keys
```

#### Transaction Model
```typescript
- id: Integer (Primary Key)
- propertyId: Integer (Unique Foreign Key)
- purchasePrice, repairExpense, documentationExpense: Decimal
- interestExpense, otherExpense: Decimal
- salePrice, serviceFee: Decimal
- profit: Decimal (Calculated)
- saleDate: DateTime
- buyerId, agentId: Foreign Keys
```

### 4.2 Enum Tipləri
- **UserRole**: ADMIN, AGENT
- **ContactType**: OWNER, BUYER  
- **DocumentType**: CIXARIS, MUQAVILE, SERENCAM
- **RepairStatus**: TEMIRLI, TEMIRSIZ
- **PropertyType**: HEYET_EVI, OBYEKT, MENZIL, TORPAQ
- **PropertyPurpose**: SATIS, ICARE
- **PropertyStatus**: YENI, GOZLEMEDE, BEH_VERILIB, SATILIB, ICAREYE_VERILIB

---

## 5. API Endpoints və Funksionallıq

### 5.1 Agent Management
```
GET /api/agents - Aktiv agentlərin siyahısı və statistikaları
```

### 5.2 Analytics
```  
GET /api/analytics/dashboard - Ümumi dashboard statistikaları
GET /api/analytics/monthly - Son 12 ayın fəaliyyət statistikası
```

### 5.3 Contact Management
```
GET /api/contacts - Bütün müştərilərin siyahısı
POST /api/contacts - Yeni müştəri yaratma
GET /api/contacts/[id] - Müəyyən müştərinin məlumatları
PUT /api/contacts/[id] - Müştəri məlumatlarını yeniləmə
DELETE /api/contacts/[id] - Müştərini silmə
```

### 5.4 Export Functionality
```
GET /api/export/properties - Əmlak məlumatlarının Excel ixracı  
GET /api/export/transactions - Əməliyyat məlumatlarının Excel ixracı
```

### 5.5 Property Management
```
GET /api/properties - Əmlak siyahısı (filtrləmə dəstəyi)
POST /api/properties - Yeni əmlak yaratma
GET /api/properties/[id] - Müəyyən əmlakın məlumatları
PUT /api/properties/[id] - Əmlak məlumatlarını yeniləmə
DELETE /api/properties/[id] - Əmlakı silmə
```

### 5.6 Transaction Management
```
GET /api/transactions - Əməliyyat siyahısı
POST /api/transactions - Yeni əməliyyat yaratma
PUT /api/transactions/[id] - Əməliyyatı yeniləmə
```

---

## 6. UI/UX Komponentləri və İş Axınları

### 6.1 Texnoloji Stack
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui (New York style)
- **Qrafiklər**: Recharts kitabxanası
- **Form İdarəetməsi**: React Hook Form
- **İkon**: Lucide React

### 6.2 Komponent Strukturu
```
components/
├── ui/ - Ümumi UI komponentləri (shadcn/ui)
├── layout/ - Header, Sidebar, Navigation
├── auth/ - Autentifikasiya komponentləri  
├── dashboard/ - Dashboard spesifik komponentlər
├── properties/ - Əmlak idarəetmə komponentləri
├── customers/ - Müştəri idarəetmə komponentləri
├── transactions/ - Əməliyyat komponentləri
└── providers.tsx - React Query və digər provider-lər
```

### 6.3 Əsas İş Axınları

#### Login İş Axını
1. İstifadəçi email və şifrəni daxil edir
2. Sistem məlumatları doğrulayır
3. Uğurlu giriş halında JWT token yaradılır
4. İstifadəçi /dashboard səhifəsinə yönləndirilir

#### Əmlak Əlavə Etmə İş Axını
1. İstifadəçi "Əmlak Əlavə Et" düyməsini basır
2. Əmlak məlumatları formu açılır
3. Əmlak sahibi məlumatları daxil edilir (yeni müştəri yaradılır)
4. Əmlak məlumatları təsdiqlənir və saxlanılır
5. Sənəd nömrəsi avtomatik generasiya olunur

#### Əməliyyat Yaratma İş Axını  
1. Əmlak seçilir (dropdown vasitəsilə)
2. Alış qiyməti və xərclər daxil edilir
3. Satış məlumatları əlavə edilir (əgər varsa)
4. Sistem avtomatik olaraq mənfəəti hesablayır
5. Əməliyyat saxlanılır və əmlak statusu yenilənir

---

## 7. Biznes Məntiqi və Qaydalar

### 7.1 Mənfəət Hesablanması
```
Mənfəət = (Satış Qiyməti + Xidmət Haqqı) - Alış Qiyməti - Ümumi Xərclər

Ümumi Xərclər = Təmir Xərcləri + Sənədləşmə Xərcləri + Faiz Xərcləri + Digər Xərclər
```

### 7.2 Sənəd Nömrəsi Generasiyası
- Format: `REA-` prefiksi + 4 rəqəmli artan nömrə
- Nümunə: `REA-0001`, `REA-0002`, `REA-0003`
- Unikal olması təmin edilir

### 7.3 Status Avtomatik Yenilənməsi
- Əməliyyatda `salePrice` və `saleDate` daxil edildikdə:
  - Purpose = SATIS olarsa → Status = SATILIB
  - Purpose = ICARE olarsa → Status = ICAREYE_VERILIB

### 7.4 Məlumat Bütövlüyü Qaydaları
- Müştəri silinməzdən əvvəl əlaqəli əmlakların yoxlanılması
- Əmlak silinməzdən əvvəl əlaqəli əməliyyatların yoxlanılması  
- Telefon nömrəsi unikallığının təmin edilməsi
- Email ünvanı unikallığının təmin edilməsi

---

## 8. Texniki Arxitektura Qərarları

### 8.1 Framework və Texnologiya Seçimləri
- **Next.js 15**: App Router və server-side rendering
- **TypeScript**: Tam tip təhlükəsizliyi
- **PostgreSQL + Prisma**: Güçlü verilənlər bazası həlli
- **NextAuth.js**: Enterprise-level autentifikasiya
- **Docker**: Konteynerləşdirmə və deployment

### 8.2 Arxitektura Prinsipləri
- **Monolit Yanaşma**: Frontend və backend vahid layihədə
- **Server-Side Rendering**: SEO və performans üçün
- **API-First Design**: Ayrı frontend təkmilləşdirmə imkanı
- **Type Safety**: End-to-end TypeScript istifadəsi

### 8.3 Folder Structure
```
src/
├── app/ - Next.js App Router
│   ├── (auth)/ - Autentifikasiya səhifələri
│   ├── (protected)/ - Qorunan dashboard səhifələri
│   └── api/ - Backend API routes
├── components/ - React komponentləri
├── hooks/ - Custom React hooks
├── lib/ - Utility funksiyalar və konfiqurasiyalar
└── types/ - TypeScript type definisiyaları
```

---

## 9. Performans Optimizasiyaları

### 9.1 Client-Side Optimizasiyalar
- **Lazy Loading**: `React.lazy` ilə komponent yükləməsi
- **Code Splitting**: Webpack bundle optimizasiyası
- **Caching**: `useCache` hook ilə API nəticələrinin keşlənməsi
- **Debouncing**: `useDebounce` ilə axtarış optimizasiyası
- **Memoization**: `React.memo` ilə render optimizasiyası

### 9.2 Server-Side Optimizasiyalar
- **Database Indexing**: Prisma schema-da index təyinatları
- **API Caching**: HTTP Cache-Control header-ləri
- **Bundle Optimization**: next.config.js-də Webpack konfiqurasiyası
- **Image Optimization**: Next.js Image komponenti

### 9.3 Build Optimizasiyaları
```javascript
// next.config.js-dən nümunə
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    recharts: { name: 'recharts', priority: 20 },
    react: { name: 'react', priority: 20 },
    vendor: { name: 'vendors', priority: -10 }
  }
}
```

---

## 10. Boşluqlar və Təkmilləşdirmə Sahələri

### 10.1 Kritik Boşluqlar
1. **Test Coverage**: Unit, integration və E2E testlər yoxdur
2. **Server-Side Validation**: API-larda güclü validasiya mexanizmi yoxdur  
3. **Admin Panel**: ADMIN rolu üçün xüsusi interfeys mövcud deyil
4. **Error Handling**: Daha detallı və kontekstə uyğun xəta mesajları

### 10.1.1 Həll Edilmiş Problemlər
- ✅ **Responsive Navigation**: Sidebar kiçik ekranlarda görünməmə problemi həll edildi (2025-07-21)

### 10.2 Təkmilləşdirmə Tövsiyələri

#### İmmediate Improvements (1-2 həftə)
- **Jest + React Testing Library**: Test infrastructure qurmaq
- **Zod Integration**: Server-side schema validasiyası
- **Admin Dashboard**: ADMIN rolü üçün idarəetmə paneli
- **Better Error Messages**: İstifadəçi dostluğu xəta mesajları

#### Short-term Improvements (1-2 ay)  
- **Internationalization (i18n)**: next-intl ilə çoxdilli dəstək
- **Advanced Filtering**: Daha kompleks axtarış və filtr sistemi
- **Notification System**: Real-time bildirişlər
- **File Upload**: Sənəd və şəkil yükləmə funksiyası

#### Long-term Improvements (3-6 ay)
- **Mobile App**: React Native ilə mobil tətbiq
- **Advanced Analytics**: Daha detallı hesabatlar və dashboard
- **Integration APIs**: Üçüncü tərəf servislər ilə inteqrasiya
- **Microservices Migration**: Böyük scale üçün arxitektura dəyişikliyi

### 10.3 Texniki Debt
- **Hardcoded Data**: Rayonlar kimi məlumatlar DB-yə köçürülməli
- **State Management**: Böyük tətbiqlər üçün Zustand və ya Jotai
- **Security Audit**: Təhlükəsizlik yoxlaması və penetration testing
- **Performance Monitoring**: APM toolları ilə real-time monitorinq

---

## 11. Nəticə və Yekun Qiymətləndirmə

REA Invest hal-hazırda funksional və istifadəyə hazır bir əmlak idarəetmə sistemidir. Layihə müasir texnologiyalarla qurulub və əsas biznes tələblərini ödəyir. Ancaq istehsal mühitində daha etibarlı istifadə üçün test coverage, validasiya və error handling kimi sahələrdə təkmilləşdirmələr tələb olunur.

### Güclü Tərəfləri:
- Müasir texnoloji stack
- Təmiz və skalabel arxitektura  
- İstifadəçi dostluğu interfeys
- Performans optimizasiyaları
- Docker dəstəyi

### İnkişaf Prioritetləri:
1. Test infrastructure və coverage
2. Server-side validasiya
3. Admin panel functionality
4. Error handling improvements
5. Internationalization support

Bu PRD sənədi layihənin indiki vəziyyətini əks etdirir və gələcək inkişaf planları üçün əsas təşkil edir.