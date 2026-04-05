# 🔒 AI Kuralları

> Bu kurallar tüm AI araçları için geçerlidir.
> Cursor, Windsurf, Claude Code, Kilo Code, Roo Code, Cline, v0

---

## ⛔ YAPMA

1. **`components/ui/` klasörünü değiştirme**
   - Bu shadcn/ui tarafından yönetiliyor
   - Yeni shadcn component eklemek için: `npx shadcn@latest add [name]`

2. **localStorage kullanma**
   - Database entegrasyonu kullan (Supabase, Neon, vb.)
   - Geçici state için React state/context kullan

3. **`any` type kullanma**
   - `lib/types.ts`'de proper type tanımla
   - Generic kullan gerektiğinde

4. **CSS-in-JS veya inline styles kullanma**
   - Tailwind CSS kullan
   - Gerekirse globals.css'e ekle

5. **Büyük component yazma**
   - Max 100-150 satır
   - Parçalara böl, compose et

6. **Import'ları manuel yönetme**
   - Barrel exports kullan (`index.ts`)
   - Path alias kullan (`@/components/*`)

---

## ✅ YAP

1. **Her değişikliği belgele**
   ```markdown
   // docs/history.md'ye ekle:
   ## [TARIH] vX.Y.Z - Başlık
   ### 💬 Soru
   ### 🎯 Yapılanlar
   ### 📁 Değişen Dosyalar
   ### 🔑 Anahtar Kelimeler
   ```

2. **Type-first geliştir**
   ```typescript
   // Önce type tanımla
   interface User {
     id: string
     name: string
   }
   // Sonra kullan
   ```

3. **Component'leri dokümante et**
   ```tsx
   /**
    * @component ComponentName
    * @description Ne yapar
    * @ai-context Hangi sistem/flow'un parçası
    */
   ```

4. **Console.log prefix kullan**
   ```typescript
   console.log('[v0] Debug message:', data)
   ```

5. **Semantic HTML kullan**
   ```tsx
   // ✅
   <main><article><section>
   
   // ❌
   <div><div><div>
   ```

6. **Accessibility düşün**
   ```tsx
   <button aria-label="Close" onClick={onClose}>
     <X className="sr-only" />
   </button>
   ```

---

## 📁 Dosya Oluşturma Kuralları

### Yeni Component
```
components/features/[feature]/[name].tsx

1. Type tanımla veya import et
2. Props interface'i export et  
3. Component'i export et
4. Default export KULLANMA
```

### Yeni Hook
```
hooks/use-[name].ts

1. Return type tanımla
2. Named export kullan
3. JSDoc ile dokümante et
```

### Yeni Route
```
app/(routes)/[route]/page.tsx

1. Server Component olarak başla
2. Gerekirse 'use client' ekle
3. Metadata export et
```

---

## 🔄 Geliştirme Döngüsü

```
1. docs/plan.md oku (mevcut faz)
2. Task'ı anla
3. Mevcut kodu incele (grep, read)
4. Implement et
5. Test et
6. docs/history.md güncelle
7. Commit at
```

---

## 📝 Commit Message Format

```
<type>(<scope>): <short description>

[AI-PROMPT]: Kullanılan prompt özeti
[CHANGES]: 
- Değişiklik 1
- Değişiklik 2

Types: feat, fix, docs, style, refactor, test, chore
Scopes: auth, ui, api, config, docs
```

---

## 🚨 Hata Durumunda

1. **Hata mesajını tam olarak paylaş**
2. **Dosya yolu ve satır numarası belirt**
3. **Son yapılan değişikliği belirt**
4. **Beklenen vs gerçek davranışı açıkla**

```
[ERROR]: Cannot read property 'x' of undefined
[FILE]: /app/page.tsx:42
[LAST CHANGE]: useAuth hook eklendi
[EXPECTED]: User objesi dönmeli
[ACTUAL]: undefined dönüyor
```
