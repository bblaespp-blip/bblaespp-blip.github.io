// ==========================================
// 🎨 BASE DE DATOS DE TUS IMÁGENES
// ==========================================

const GALERIA = {
  // 1. ILUSTRACIONES SUELTAS
  ILUSTRACION: [
    "ILUSTRACION/1.png",
    "ILUSTRACION/2.png",
    "ILUSTRACION/3.png",
    "ILUSTRACION/4.png"
  ],

  SFW: [
    "sfw/1.png"
  ],

  NSFW: [
    "nsfw/1.png",
    "nsfw/2.png"
  ],

  FONDOS: [
    "FONDOS/X.png"
  ],

  // 2. CÓMICS Y MANGA NORMALES (SFW)
  comicsSFW: [
    {
      id: "ww1",
      title: "Primera Guerra Mundial",
      cover: "COMICS/PAG1.png",
      pages: [
        "COMICS/PAG1.png",
        "COMICS/PAG2.png",
        "COMICS/PAG3.png",
        "COMICS/PAG4.png"
      ]
    },
    {
      id: "extra",
      title: "Historias Cortas",
      cover: "COMICS/3.png",
      pages: [
        "COMICS/3.png",
        "COMICS/4.png"
      ]
    }
  ],

  // 3. CÓMICS +18 (NSFW)
  comicsNSFW: [
    {
      id: "nsfw_comic1",
      title: "PRUEBA XD 🔞",
      cover: "nsfw/1.png",
      pages: [
        "nsfw/1.png",
        "nsfw/2.png"
      ]
    }
  ]
};
