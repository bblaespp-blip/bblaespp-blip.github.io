// ==========================================
// 🎨 BASE DE DATOS DE TUS IMÁGENES
// ==========================================

const GALERIA = {
  // 1. ILUSTRACIONES SUELTAS
  ILUSTRACION: [
    "ILUSTRACION/1.png", "ILUSTRACION/2.png", "ILUSTRACION/3.png", "ILUSTRACION/4.png", "ILUSTRACION/5.png", "ILUSTRACION/6.png", "ILUSTRACION/7.png",
    "ILUSTRACION/8.png", "ILUSTRACION/9.png", "ILUSTRACION/10.png", "ILUSTRACION/11.png", "ILUSTRACION/12.png", "ILUSTRACION/13.png"
  ],

  SFW: [
    "sfw/1.png"
  ],

  NSFW: [
    "nsfw/1.png", "nsfw/2.png", "nsfw/3.png", "nsfw/4.png", "nsfw/5.png"
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
        "COMICS/PAG1.png","COMICS/PAG2.png","COMICS/PAG3.png", "COMICS/PAG4.png"
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
        "nsfw/1.png","nsfw/2.png"
      ]
    }
  ]
};
