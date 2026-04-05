# Prompt Templates Index
# Task listesi olusturmak icin kullanilan sablonlar

---
version: "1.0"
type: prompts
editable: true
last_updated: "2026-04-04"
---

## Task Generation Prompts

### analyze_request
```
Kullanici istegini analiz et:
1. Ne isteniyor? (ozet)
2. Hangi dosyalar etkilenecek?
3. Tahmini token sayisi?
4. Hangi agent uygun? (task/supervisor)
5. Hangi rol gerekli? (code/plan/debug/etc)

Istek: {{user_request}}
```

### create_task_list
```
Asagidaki istek icin task listesi olustur:

Istek: {{user_request}}
Mevcut Dosyalar: {{file_list}}
Plan Durumu: {{current_phase}}

Format:
| # | Task | Agent | Role | Est. Tokens | Priority |
|---|------|-------|------|-------------|----------|

Kurallar:
- Maksimum 7 task
- Her task bagimsiz olabilmeli
- Oncelik: P0 (kritik) -> P3 (dusuk)
```

### code_task
```
Gorev: {{task_description}}
Dosyalar: {{target_files}}
Rol: code

Yapilacaklar:
1. Mevcut kodu oku ve anla
2. Degisiklikleri planla
3. Kodu yaz/duzenle
4. HISTORY.md'ye kaydet

Cikti:
- Degisiklik ozeti
- Etkilenen dosyalar
- Test onerileri
```

### review_task
```
Gorev: {{task_description}}
Dosyalar: {{target_files}}
Rol: review

Kontrol listesi:
- [ ] TypeScript hatalari
- [ ] Best practices
- [ ] Performance
- [ ] Security
- [ ] Accessibility

Cikti:
- Bulgular (iyi/kotu)
- Skor (1-10)
- Aksiyon maddeleri
```

### plan_task
```
Gorev: {{task_description}}
Mevcut Plan: {{current_plan}}
Rol: plan

Analiz:
1. Mevcut durum
2. Hedef durum
3. Gap analizi
4. Onerilen adimlar

Cikti:
- Guncel plan
- Task breakdown
- Risk analizi
```

## Context Injection Prompts

### inject_file_context
```
Dosya Konteksti:
Yol: {{file_path}}
Icerik:
\`\`\`{{file_extension}}
{{file_content}}
\`\`\`
Son Degisiklik: {{last_modified}}
```

### inject_history_context
```
Son Degisiklikler (HISTORY.md):
{{recent_history}}

Dikkat edilecekler:
- {{warnings}}
```

### inject_rules_context
```
Aktif Kurallar:
Sistem: {{system_rules_summary}}
Proje: {{project_rules_summary}}
Rol: {{role_rules}}
```

## Output Format Prompts

### task_complete_output
```
## Task Tamamlandi: {{task_name}}

### Degisiklikler
{{changes_list}}

### Dosyalar
| Dosya | Islem | Satirlar |
|-------|-------|----------|
{{file_changes_table}}

### Sonraki Adim
{{next_step_suggestion}}

### Sorular (Supervisor icin)
{{questions_for_review}}
```

---

# Metadata
keywords: [prompts, templates, task-generation, context-injection]
category: prompts
priority: high
