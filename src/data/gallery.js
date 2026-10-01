// Galeri — photos, videos and before/after comparisons of our work.
//
// HOW TO ADD YOUR OWN
// 1. Put files in  public/gallery/  (photos: .webp or .jpg, videos: .mp4 H.264).
//    Keep videos short (10–30 s) and under ~8 MB so they load fast on phones.
// 2. Add an entry below. `width`/`height` are the file's real pixel size (used to
//    reserve space so the page doesn't jump while loading).
//
//   Photo:
//   { id: "sofa-l-shape", type: "photo", src: "/gallery/sofa-l-shape.webp", width: 1200, height: 1500,
//     service: "sofa", caption: { ms: "Sofa L-shape, Rahang", en: "L-shaped sofa, Rahang" } },
//
//   Video. `poster` is the still image shown before playing (see "Adding videos" in
//   README — the compress script creates it from the `thumbAt` second).
//   { id: "karpet-masjid-video", type: "video", src: "/gallery/karpet-masjid.mp4", poster: "/gallery/karpet-masjid.jpg",
//     width: 1080, height: 1920, service: "mosque", caption: { ms: "Proses cucian karpet masjid", en: "Mosque carpet wash" } },
//
//   Before / after (drag slider):
//   { id: "tilam-queen", type: "beforeAfter", before: "/gallery/tilam-before.webp", after: "/gallery/tilam-after.webp",
//     width: 1200, height: 900, service: "mattress", caption: { ms: "Tilam queen", en: "Queen mattress" } },
//
// 3. Delete the `demo` entries once you have real ones — the "illustration" note
//    disappears automatically when no demo entries remain.
//
// `service` is one of the ids in src/data/services.js and shows as a label.

export const galleryItems = [
  // --- Cucian Sofa ---
  { id: "sofa-video-1", type: "video", src: "/gallery/cucian-sofa-1.mp4", poster: "/gallery/cucian-sofa-1.jpg", thumbAt: 3, width: 464, height: 832, service: "sofa",
    caption: { ms: "Proses cucian sofa — berus, sedut & hasil akhir", en: "Sofa cleaning process — scrub, extract & result" } },
  { id: "sofa-kelabu-sebelum", type: "photo", src: "/gallery/sofa-kelabu-sebelum.jpg", width: 828, height: 620, service: "sofa",
    caption: { ms: "Sofa L-shape kelabu — sebelum", en: "Grey L-shaped sofa — before" } },
  { id: "sofa-kelabu-selepas", type: "photo", src: "/gallery/sofa-kelabu-selepas.jpg", width: 828, height: 620, service: "sofa",
    caption: { ms: "Sofa L-shape kelabu — selepas", en: "Grey L-shaped sofa — after" } },
  { id: "sofa-biru", type: "photo", src: "/gallery/sofa-biru-sebelum-selepas.jpg", width: 1200, height: 1200, service: "sofa",
    caption: { ms: "Sofa 3 tempat duduk — sebelum & selepas", en: "3-seater sofa — before & after" } },
  { id: "sofa-video-2", type: "video", src: "/gallery/cucian-sofa-2.mp4", poster: "/gallery/cucian-sofa-2.jpg", thumbAt: 3, width: 576, height: 1024, service: "sofa",
    caption: { ms: "Sofa fabrik krim — dari kotor ke bersih", en: "Cream fabric sofa — from dirty to clean" } },
  { id: "sofa-hijau", type: "photo", src: "/gallery/sofa-hijau-separuh.jpg", width: 828, height: 620, service: "sofa",
    caption: { ms: "Sofa hijau kebiruan — perbezaan sebelum dan selepas", en: "Teal sofa — difference before and after" } },
  { id: "sofa-ruang-tamu", type: "photo", src: "/gallery/cuci-set-sofa-ruang-tamu.jpg", width: 828, height: 592, service: "sofa",
    caption: { ms: "Pasukan kami mencuci set sofa di rumah pelanggan", en: "Our team cleaning a sofa set at a customer's home" } },
  { id: "kerusi-makan", type: "photo", src: "/gallery/cuci-kerusi-makan-baldu.jpg", width: 1050, height: 1400, service: "sofa",
    caption: { ms: "Cucian kerusi makan baldu", en: "Velvet dining chair cleaning" } },

  // --- Cucian Seat Kereta ---
  { id: "seat-video-1", type: "video", src: "/gallery/cucian-seat-kereta-1.mp4", poster: "/gallery/cucian-seat-kereta-1.jpg", thumbAt: 12, width: 576, height: 1024, service: "carseat",
    caption: { ms: "Cucian seat kereta di rumah customer", en: "Car seat cleaning at customer's house" } },
  { id: "seat-hitam-sebelum", type: "photo", src: "/gallery/seat-kereta-hitam-sebelum.jpg", width: 960, height: 1280, service: "carseat",
    caption: { ms: "Seat belakang fabrik hitam — sebelum", en: "Black fabric rear seat — before" } },
  { id: "seat-hitam-selepas", type: "photo", src: "/gallery/seat-kereta-hitam-selepas.jpg", width: 960, height: 1280, service: "carseat",
    caption: { ms: "Seat belakang fabrik hitam — selepas", en: "Black fabric rear seat — after" } },
  { id: "seat-beige-sebelum", type: "photo", src: "/gallery/seat-kereta-beige-sebelum.jpg", width: 828, height: 1472, service: "carseat",
    caption: { ms: "Seat belakang MPV beige — sebelum", en: "Beige MPV rear seat — before" } },
  { id: "seat-beige-selepas", type: "photo", src: "/gallery/seat-kereta-beige-selepas.jpg", width: 828, height: 1472, service: "carseat",
    caption: { ms: "Seat belakang MPV beige — selepas", en: "Beige MPV rear seat — after" } },
  { id: "seat-video-2", type: "video", src: "/gallery/cucian-seat-kereta-2.mp4", poster: "/gallery/cucian-seat-kereta-2.jpg", thumbAt: 12, width: 576, height: 1024, service: "carseat",
    caption: { ms: "Gosok, sedut & bilas — seat kereta bersih semula", en: "Scrub, extract & rinse — car seats clean again" } },
  { id: "seat-gosok", type: "photo", src: "/gallery/seat-kereta-gosok.jpg", width: 960, height: 1280, service: "carseat",
    caption: { ms: "Menggosok seat belakang dengan berus mesin", en: "Scrubbing the rear seat with a machine brush" } },
  { id: "seat-video-4", type: "video", src: "/gallery/cucian-seat-kereta-4.mp4", poster: "/gallery/cucian-seat-kereta-4.jpg", thumbAt: 2, width: 576, height: 1024, service: "carseat",
    caption: { ms: "Seat belakang selepas dicuci", en: "Rear seats after cleaning" } },
  { id: "seat-di-kedai", type: "photo", src: "/gallery/seat-kereta-di-kedai.jpg", width: 960, height: 1280, service: "carseat",
    caption: { ms: "Cucian seat kereta di kedai kami, Cuci Cuci Senawang", en: "Car seat cleaning at our Cuci Cuci Senawang shop" } },

  // --- Cucian Karpet Masjid ---
  { id: "masjid-video-5", type: "video", src: "/gallery/cucian-karpet-masjid-5.mp4", poster: "/gallery/cucian-karpet-masjid-5.jpg", thumbAt: 1.5, width: 576, height: 1024, service: "mosque",
    caption: { ms: "Masjid Muhammad Al-Fateh, Kem Wardieburn", en: "Masjid Muhammad Al-Fateh, Kem Wardieburn" } },
  { id: "masjid-video-2", type: "video", src: "/gallery/cucian-karpet-masjid-2.mp4", poster: "/gallery/cucian-karpet-masjid-2.jpg", thumbAt: 15, width: 576, height: 1024, service: "mosque",
    caption: { ms: "Surau Taman SIGC, Paroi", en: "Surau Taman SIGC, Paroi" } },
  { id: "masjid-video-1", type: "video", src: "/gallery/cucian-karpet-masjid-1.mp4", poster: "/gallery/cucian-karpet-masjid-1.jpg", thumbAt: 6, width: 464, height: 832, service: "mosque",
    caption: { ms: "Madrasah Hidayah Seksyen 11, Shah Alam", en: "Madrasah Hidayah Seksyen 11, Shah Alam" } },
  { id: "masjid-video-3", type: "video", src: "/gallery/cucian-karpet-masjid-3.mp4", poster: "/gallery/cucian-karpet-masjid-3.jpg", thumbAt: 18, width: 576, height: 1024, service: "mosque",
    caption: { ms: "Masjid Kariah Kampung Pilin, Rembau", en: "Masjid Kariah Kampung Pilin, Rembau" } },
  { id: "masjid-video-4", type: "video", src: "/gallery/cucian-karpet-masjid-4.mp4", poster: "/gallery/cucian-karpet-masjid-4.jpg", thumbAt: 15, width: 576, height: 1024, service: "mosque",
    caption: { ms: "Masjid Kariah Sawah Raja, Rembau", en: "Masjid Kariah Sawah Raja, Rembau" } },

  // --- Cucian Karpet Pejabat ---
  { id: "pejabat-video-1", type: "video", src: "/gallery/cucian-karpet-pejabat-1.mp4", poster: "/gallery/cucian-karpet-pejabat-1.jpg", thumbAt: 29, width: 576, height: 1024, service: "office",
    caption: { ms: "Cucian karpet pejabat — mesin ekstraktor & blower", en: "Office carpet cleaning — extractor & blower" } },
  { id: "pejabat-mesin", type: "photo", src: "/gallery/karpet-pejabat-mesin-cuci.jpg", width: 828, height: 1083, service: "office",
    caption: { ms: "Cucian karpet pejabat dengan mesin ekstraktor", en: "Office carpet cleaning with an extractor machine" } },
  { id: "pejabat-video-2", type: "video", src: "/gallery/cucian-karpet-pejabat-2.mp4", poster: "/gallery/cucian-karpet-pejabat-2.jpg", thumbAt: 34, width: 464, height: 832, service: "office",
    caption: { ms: "Kami bawa peralatan terus ke pejabat anda", en: "We bring the equipment straight to your office" } },
  { id: "pejabat-vakum", type: "photo", src: "/gallery/karpet-pejabat-vakum.jpg", width: 828, height: 620, service: "office",
    caption: { ms: "Vakum karpet pejabat sebelum dicuci", en: "Vacuuming an office carpet before washing" } },
  { id: "pejabat-video-3", type: "video", src: "/gallery/cucian-karpet-pejabat-3.mp4", poster: "/gallery/cucian-karpet-pejabat-3.jpg", thumbAt: 10, width: 576, height: 1024, service: "office",
    caption: { ms: "Mesin cuci karpet di bilik pejabat", en: "Carpet extractor at work in an office room" } },

  // --- Cucian Tilam ---
  { id: "tilam-corak-ba", type: "photo", src: "/gallery/tilam-corak-sebelum-selepas.jpg", width: 1010, height: 1280, service: "mattress",
    caption: { ms: "Tilam queen — sebelum & selepas", en: "Queen mattress — before & after" } },
  { id: "tilam-video-1", type: "video", src: "/gallery/cucian-tilam-1.mp4", poster: "/gallery/cucian-tilam-1.jpg", thumbAt: 11, width: 576, height: 1024, service: "mattress",
    caption: { ms: "Cucian tilam di rumah pelanggan — siap kurang 2 jam", en: "Mattress cleaned at the customer's home — done in under 2 hours" } },
  { id: "tilam-kuilt-sebelum", type: "photo", src: "/gallery/tilam-kuilt-sebelum.jpg", width: 720, height: 960, service: "mattress",
    caption: { ms: "Tilam putih bertompok — sebelum", en: "Stained white mattress — before" } },
  { id: "tilam-kuilt-selepas", type: "photo", src: "/gallery/tilam-kuilt-selepas.jpg", width: 720, height: 960, service: "mattress",
    caption: { ms: "Tilam putih bertompok — selepas", en: "Stained white mattress — after" } },
  { id: "tilam-video-2", type: "video", src: "/gallery/cucian-tilam-2.mp4", poster: "/gallery/cucian-tilam-2.jpg", thumbAt: 12, width: 576, height: 1024, service: "mattress",
    caption: { ms: "Tilam bertompok — gosok, sedut & lihat air kotornya", en: "Stained mattress — scrub, extract & see the dirty water" } },
  { id: "topper-sebelum", type: "photo", src: "/gallery/topper-icool-sebelum.jpg", width: 960, height: 1280, service: "mattress",
    caption: { ms: "Topper tilam dengan kesan tompok — sebelum", en: "Mattress topper with a stain ring — before" } },
  { id: "topper-selepas", type: "photo", src: "/gallery/topper-icool-selepas.jpg", width: 960, height: 1280, service: "mattress",
    caption: { ms: "Topper tilam — selepas", en: "Mattress topper — after" } },
  { id: "tilam-corak-sebelum", type: "photo", src: "/gallery/tilam-corak-sebelum.jpg", width: 960, height: 1280, service: "mattress",
    caption: { ms: "Tilam dengan kotoran & kulat — sebelum dicuci", en: "Mattress with dirt & mould — before cleaning" } },
  { id: "tilam-video-3", type: "video", src: "/gallery/cucian-tilam-3.mp4", poster: "/gallery/cucian-tilam-3.jpg", thumbAt: 3, width: 1024, height: 576, service: "mattress",
    caption: { ms: "Sedut kotoran tilam dengan mesin ekstraktor", en: "Extracting dirt from a mattress" } },

  // --- Cucian Karpet ---
  { id: "karpet-video-1", type: "video", src: "/gallery/cucian-karpet-1.mp4", poster: "/gallery/cucian-karpet-1.jpg", thumbAt: 25, width: 576, height: 1024, service: "carpet",
    caption: { ms: "Proses cucian karpet — basuh, sental mesin & keringkan", en: "Carpet washing — rinse, machine scrub & dry" } },
  { id: "karpet-depan-kedai", type: "photo", src: "/gallery/karpet-di-depan-kedai.jpg", width: 1050, height: 1400, service: "carpet",
    caption: { ms: "Karpet size 13' x 10' untuk dicuci", en: "Carpet size 13' x 10' for cleaning" } },
  { id: "karpet-dijemur", type: "photo", src: "/gallery/karpet-dijemur-kering.jpg", width: 828, height: 620, service: "carpet",
    caption: { ms: "Karpet pelanggan dikeringkan di rak", en: "Customers' carpets drying on racks" } },
  { id: "karpet-video-2", type: "video", src: "/gallery/cucian-karpet-2.mp4", poster: "/gallery/cucian-karpet-2.jpg", thumbAt: 16, width: 576, height: 1024, service: "carpet",
    caption: { ms: "Karpet siap dibalut plastik & dilabel sebelum dihantar", en: "Carpets wrapped & labelled before delivery" } },
  { id: "karpet-rak", type: "photo", src: "/gallery/karpet-rak-pengering.jpg", width: 1050, height: 1400, service: "carpet",
    caption: { ms: "Rak pengering karpet di kedai kami", en: "Carpet drying racks at our shop" } },
  { id: "karpet-menunggu", type: "photo", src: "/gallery/karpet-menunggu-dicuci.jpg", width: 1050, height: 1400, service: "carpet",
    caption: { ms: "Karpet pelanggan menunggu giliran untuk dicuci", en: "Customers' carpets waiting to be washed" } },
  { id: "karpet-video-3", type: "video", src: "/gallery/cucian-karpet-3.mp4", poster: "/gallery/cucian-karpet-3.jpg", thumbAt: 3, width: 576, height: 1024, service: "carpet",
    caption: { ms: "Kedai kami, Dobi Karpet Xpress — penuh dengan karpet pelanggan", en: "Our shop, Dobi Karpet Xpress — full of customers' carpets" } },
  { id: "karpet-dalam-kedai", type: "photo", src: "/gallery/karpet-dalam-kedai.jpg", width: 828, height: 1104, service: "carpet",
    caption: { ms: "Karpet siap dibalut, sedia untuk dihantar", en: "Wrapped carpets, ready for delivery" } },];

// Number of gallery items for a service id (used by the filters and service cards).
export const galleryCount = (service) => galleryItems.filter((i) => i.service === service).length;
