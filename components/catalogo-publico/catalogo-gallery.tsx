const photos = [
  ["/catalogo/galeria/showroom-stock.png", "Stock seleccionado"],
  ["/catalogo/galeria/mustang.png", "Clásicos con historia"],
  ["/catalogo/galeria/taller.png", "Preparación y cuidado"],
  ["/catalogo/galeria/evento-showroom.png", "Una comunidad que comparte la pasión"],
  ["/catalogo/galeria/coleccion-clasicos.png", "Piezas únicas"],
  ["/catalogo/galeria/sala-espera.png", "Atención personalizada"],
];

export function CatalogoGallery() {
  return (
    <div className="grid auto-rows-[180px] grid-cols-2 gap-2 sm:auto-rows-[220px] sm:grid-cols-4 lg:auto-rows-[250px]">
      {photos.map(([src, label], index) => (
        <figure key={src} className={`group relative overflow-hidden bg-[#111827] ${index === 0 || index === 3 ? "col-span-2 row-span-2" : "row-span-1"}`}>
          <img src={src} alt={label} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/70 via-transparent to-transparent" />
          <figcaption className="absolute bottom-4 left-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">{label}</figcaption>
        </figure>
      ))}
    </div>
  );
}
