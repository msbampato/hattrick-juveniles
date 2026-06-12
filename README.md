# Ranking de ventas juveniles HT

Sitio generado desde Google Sheets.

Una vez publicado en Vercel, los datos se actualizan leyendo la hoja online:

https://docs.google.com/spreadsheets/d/14GHe8BDXpJPoIiTo6oMYdHXYlBKRPPZR4MoRG5w9pig/edit?gid=1100286737

Para publicarlo en Vercel:

1. Subi esta carpeta (`ht-ventas`) a un repositorio de GitHub.
2. En Vercel, elegi **Add New Project** e importalo.
3. Deja vacio el comando de build y usa la carpeta raiz del proyecto.
4. Deploy.

Archivos importantes:

- `index.html`: la pagina.
- `api/sheet.js`: lee la Google Sheet en Vercel.

Despues de publicar esta version, para actualizar ventas solo hace falta editar la hoja de calculo. La pagina usa una copia local si se abre sin Vercel, y datos vivos cuando esta publicada.
