# የፊት ገጽ ዲዛይን ሥርዓት

> ይህ የ[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) የአማርኛ ትርጉም ነው። የክፍል ስሞችና ኮድ እንዳሉ ተቀምጠዋል።

ለመላው ERP አንድ የእይታ ቋንቋ። ከታች ያለው ሁሉ በ`tailwind.config.js` (ቶክኖች) እና `src/index.css` (የክፍል ስሞች) ውስጥ
ይገለጻል። በገጽ ፋይሎች ውስጥ ረጅም የutility ሕብረቁምፊዎችን ከመጻፍ እነዚህን ይጠቀሙ — እዚህ የሚደረግ ለውጥ በሁሉም ገጽ ላይ
በአንድ ጊዜ ይተገበራል።

## ቶክኖች

| ቶክን | አጠቃቀም |
| --- | --- |
| `brand-50…950` | ዋና ድርጊቶች፣ ንቁ ምናሌ፣ አገናኞች፣ የትኩረት ቀለበቶች |
| `ink-50…950` | የጎን ምናሌ፣ የመስኮት ጀርባዎች፣ ጥቁር ገጽታዎች |
| `slate-*` | ጽሑፍ፣ ድንበሮች፣ ጀርባዎች (አልተቀየረም) |
| `shadow-xs / card / raised / overlay` | ብቸኛዎቹ አራት ከፍታዎች |
| `animate-fade-in / scale-in / shimmer` | የመደራረብና የአጽም እንቅስቃሴ |

ፊደሉ Inter ነው (በ`index.html` የሚጫን፣ ከሲስተም አማራጭ ጋር)። ቁጥሮች ዓምዶች እንዲጣጣሙ በሰንጠረዦችና በ`.tabular` ላይ
`font-variant-numeric: tabular-nums` ይጠቀማሉ። አማርኛ ሲመረጥ የ`Noto Sans Ethiopic` ፊደል በአማራጭነት ይጫናል።

## የክፍል ስሞች

**አዝራሮች** — `btn` እና አንድ ዓይነት፦ `btn-primary`፣ `btn-secondary`፣ `btn-danger`፣ `btn-success`፣ `btn-neutral`፣
`btn-ghost`። መጠኖች፦ `btn-sm`፣ `btn-lg`። አዶ-ብቻ፦ `btn-icon` (ሁልጊዜ `aria-label` ይጨምሩ)። ማንዣበብ፣ ንቁ፣ focus-visible እና
የተሰናከሉ ሁኔታዎች አብረው የተሰሩ ናቸው።

**ቅጾች** — በእያንዳንዱ input/select/textarea ላይ `input`፣ በመለያዎች ላይ `label`፣ ለረዳትና ለስህተት ጽሑፍ `field-hint` / `field-error`፣
ልክ ያልሆነ መስክን ለመለየት `input-error`።

**ገጽታዎች** — `card`፣ `card-pad`፣ `card-header`፣ `card-title`።

**ጽሕፈት** — `page-title`፣ `page-subtitle`፣ `section-title`፣ `eyebrow`።

**ማንቂያዎች** — `alert` እና `alert-error` / `alert-success` / `alert-warning` / `alert-info`።

**ሰንጠረዦች** — በእጅ ለሚሠሩ ሰንጠረዦች `th` / `td`፤ `<DataTable>` ይመረጣል።

## የጋራ ክፍሎች (`src/components`)

`Icon` (የውስጥ SVG ስብስብ — የአዶ ጥገኝነት የለም)፣ `DataTable` (በኮምፒውተር ላይ የሚጣበቅ ራስጌ፣ በስልክ የካርድ ዝርዝር)፣ `Modal`፣
`ConfirmDialog`፣ `Badge`፣ `KpiCard`፣ `Pagination`፣ `EmptyState`፣ `ErrorState`፣ `LoadingState`።

የ`DataTable` አምዶች `align: 'right' | 'center'`፣ `primary: true` (የስልክ ካርዱን የሚሰይመው መስክ) እና `hideOnMobile: true`
ይቀበላሉ። በቀኝ የተደረደሩ የገንዘብ አምዶች በነባሩ `className: 'text-right'` አስቀድመው ይሠራሉ።

## የተሞክሮ ደንቦች

- ከሰፊ ይልቅ የታመቀ፦ ይህ የውሂብ ምርት ነው፣ የግብይት ገጽ አይደለም።
- ስውር ድንበሮችና ጥብቅ ጥላዎች፤ ትላልቅ ቅልመቶች ወይም ብርሃኖች የሉም።
- እያንዳንዱ መስተጋብራዊ ንጥል ማንዣበብ፣ focus-visible እና የተሰናከሉ ሁኔታዎች ያስፈልጉታል።
- ማንኛውም ሰፊ ነገር (ሰንጠረዦች፣ ኮድ፣ የchip ረድፎች) በራሱ መያዣ ውስጥ ይሸብልላል፣ ስለዚህ የገጹ አካል በጎን በኩል አይሸብልልም።
