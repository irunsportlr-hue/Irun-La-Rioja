import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ShoppingBag, ChevronLeft, ChevronRight, Truck, MapPin, Share2 } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useProductStore from '../store/useProductStore';
import useSettingsStore from '../store/useSettingsStore';
import SizeGuide from '../components/SizeGuide';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const getProductById = useProductStore(state => state.getProductById);
  const fetchProducts = useProductStore(state => state.fetchProducts);
  const products = useProductStore(state => state.products);
  const isLoading = useProductStore(state => state.isLoading);
  const product = getProductById(id);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const scrollContainerRef = useRef(null);

  const { userZipCode, setUserZipCode } = useCartStore();
  const { shippingCost, localShippingCost, mpDiscount, showTransferPrice, fetchSettings } = useSettingsStore();

  const [zipInput, setZipInput] = useState(userZipCode || '');
  const [calculatedShipping, setCalculatedShipping] = useState(null);
  
  useEffect(() => {
    fetchSettings();
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const handleCalculateShipping = () => {
    if (!zipInput.trim()) return;
    setUserZipCode(zipInput.trim());
    if (zipInput.trim() === '5300') {
      setCalculatedShipping(localShippingCost);
    } else {
      setCalculatedShipping(shippingCost);
    }
  };

  const addItem = useCartStore(state => state.addItem);

  const sizes = product?.sizes && product.sizes.length > 0 
    ? product.sizes 
    : ['Talle Único'];

  const colors = product?.colors && product.colors.length > 0 
    ? product.colors 
    : [];

  const allImages = product ? [product.image_url, ...(product.additional_images || [])] : [];

  const scrollToIndex = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTo({
        left: index * container.offsetWidth,
        behavior: 'smooth'
      });
      setCurrentImageIndex(index);
    }
  };

  const handleScroll = (e) => {
    const container = e.target;
    const index = Math.round(container.scrollLeft / container.offsetWidth);
    if (index !== currentImageIndex) {
      setCurrentImageIndex(index);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/catalog" className="btn-primary">Volver al catálogo</Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.is_visible !== false && p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, 4);

  const handleShareWhatsApp = async () => {
    setIsSharing(true);
    try {
      const finalPrice = product.discount > 0 
        ? (product.price * (1 - product.discount / 100)) 
        : product.price;
      const { mpDiscount, showTransferPrice } = useSettingsStore.getState();
      const transferPrice = finalPrice * (1 - (mpDiscount || 3.49) / 100);
      const productUrl = window.location.href;
      
      let shareText = `🔥 *${product.name}* - ${product.brand}\n`;
      if (selectedSize) shareText += `📏 Talle: ${selectedSize}\n`;
      if (selectedColor) shareText += `🎨 Color: ${selectedColor}\n`;
      
      if (showTransferPrice) {
        shareText += `💵 Efectivo/Transferencia: *$${transferPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}*\n`;
        shareText += `💳 Precio de Lista: $${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}\n`;
      } else {
        shareText += `💰 $${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}${product.discount > 0 ? ` (${product.discount}% OFF!)` : ''}\n`;
      }
      shareText += `\n🛒 Compralo en I-RUN LA RIOJA:\n${productUrl}`;

      // Create a branded image using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 1080;
      canvas.height = 1080;

      // Load product image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = product.image_url;
      });

      // Draw product image (cover fit)
      const imgRatio = img.width / img.height;
      let drawW, drawH, drawX, drawY;
      if (imgRatio > 1) {
        drawH = canvas.height;
        drawW = drawH * imgRatio;
        drawX = (canvas.width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = canvas.width;
        drawH = drawW / imgRatio;
        drawX = 0;
        drawY = (canvas.height - drawH) / 2;
      }
      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Dark gradient overlay at bottom
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.45, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.5, 'rgba(0,0,0,0.6)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Top bar with brand
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, canvas.width, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('I-RUN  /  LA RIOJA', canvas.width / 2, 46);

      // Discount badge
      if (product.discount > 0) {
        const badgeW = 180, badgeH = 50;
        const badgeX = canvas.width - badgeW - 30, badgeY = 90;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`-${product.discount}% OFF`, badgeX + badgeW / 2, badgeY + 34);
      }

      // Product name
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Arial, sans-serif';
      const nameLines = wrapText(ctx, product.name, canvas.width - 100);
      let nameY = canvas.height - 250;
      nameLines.forEach(line => {
        ctx.fillText(line, 50, nameY);
        nameY += 52;
      });

      // Brand
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(product.brand.toUpperCase(), 50, nameY + 10);

      // Selected Variants
      let variantsText = '';
      if (selectedSize) variantsText += `Talle: ${selectedSize}  `;
      if (selectedColor) variantsText += `Color: ${selectedColor}`;
      if (variantsText) {
        ctx.font = 'bold 26px Arial, sans-serif';
        ctx.fillStyle = '#ef4444';
        ctx.fillText(variantsText, 50, nameY + 50);
      }

      // Price
      let priceY = canvas.height - 60;
      
      if (showTransferPrice) {
        // Draw Transfer price
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.fillStyle = '#ef4444';
        const transferText = `$${transferPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
        ctx.fillText(transferText, 50, priceY);
        
        const trW = ctx.measureText(transferText).width;
        ctx.font = 'bold 22px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(` EFECTIVO / TRANSFERENCIA`, 50 + trW + 10, priceY - 10);

        // Draw List price below
        ctx.font = 'bold 30px Arial, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.fillText(`Lista: $${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, 50, priceY + 40);
      } else {
        ctx.font = 'bold 52px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`$${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`, 50, priceY);

        if (product.discount > 0) {
          const priceWidth = ctx.measureText(`$${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`).width;
          ctx.font = 'bold 28px Arial, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.5)';
          const oldPriceText = `$${product.price.toLocaleString('es-AR')}`;
          ctx.fillText(oldPriceText, 50 + priceWidth + 20, priceY - 5);
          const oldPriceW = ctx.measureText(oldPriceText).width;
          ctx.strokeStyle = 'rgba(255,255,255,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(50 + priceWidth + 20, priceY - 15);
          ctx.lineTo(50 + priceWidth + 20 + oldPriceW, priceY - 15);
          ctx.stroke();
        }
      }

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
      const file = new File([blob], `${product.name.replace(/\s+/g, '-')}.jpg`, { type: 'image/jpeg' });

      // Try Web Share API with file (works on mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: shareText,
          files: [file]
        });
      } else {
        // Fallback: download image + open WhatsApp with text
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${product.name.replace(/\s+/g, '-')}-IRUN.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        // Open WhatsApp with the text
        setTimeout(() => {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        }, 500);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error al compartir:', error);
        // Ultimate fallback: just open WhatsApp with link
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Helper to wrap long text on canvas
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      if (ctx.measureText(testLine).width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);
    return lines.slice(0, 2); // Max 2 lines
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Por favor selecciona un talle.");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      alert("Por favor selecciona un color.");
      return;
    }
    addItem(product, selectedSize, selectedColor);
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/catalog" className="inline-flex items-center text-gray-500 hover:text-brand-red mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          Volver al catálogo
        </Link>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Imágenes */}
          <div className="w-full md:w-1/2 relative group">
            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory rounded-3xl shadow-sm bg-gray-100 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {allImages.map((img, idx) => (
                <div key={idx} className="w-full shrink-0 snap-center relative">
                  <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Flechas (Sólo en Desktop si hay más de 1 imagen) */}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={() => scrollToIndex((currentImageIndex - 1 + allImages.length) % allImages.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center hover:scale-110"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => scrollToIndex((currentImageIndex + 1) % allImages.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center hover:scale-110"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Puntos Indicadores */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 bg-black/30 backdrop-blur-md px-3 py-2 rounded-full">
                {allImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => scrollToIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-bold tracking-wider text-gray-500 uppercase">{product.brand}</span>
              <button 
                onClick={handleShareWhatsApp}
                disabled={isSharing}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-wait"
              >
                {isSharing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                )}
                Compartir
              </button>
            </div>
            <h1 className="text-4xl font-extrabold font-montserrat text-brand-dark mb-4">{product.name}</h1>
            
            <div className="mb-6 flex flex-col">
              {(() => {
                const finalPrice = product.discount > 0 ? (product.price * (1 - product.discount / 100)) : product.price;
                const transferPrice = finalPrice * (1 - (mpDiscount || 3.49) / 100);

                if (showTransferPrice) {
                  return (
                    <>
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-red-600">
                          ${transferPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-red-600 bg-red-50 px-2 py-1 rounded uppercase tracking-wider">
                          Efectivo / Transferencia
                        </span>
                      </div>
                      
                      {product.discount > 0 ? (
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-lg font-semibold text-gray-500">
                            Precio Lista: ${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-semibold text-gray-500 mt-2 block">
                          Precio Lista: ${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      )}
                    </>
                  );
                } else {
                  return (
                    <>
                      {product.discount > 0 ? (
                        <>
                          <div className="flex items-center space-x-4 mb-1">
                            <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">
                              ${finalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm font-bold text-white bg-brand-red px-3 py-1 rounded-full shadow-sm">
                              {product.discount}% OFF
                            </span>
                          </div>
                          <span className="text-lg text-gray-400 line-through font-semibold">
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                        </>
                      ) : (
                        <span className="text-3xl sm:text-4xl font-extrabold text-brand-dark">${product.price.toLocaleString('es-AR')}</span>
                      )}
                    </>
                  );
                }
              })()}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Seleccionar Talle</h3>
                <span onClick={() => setIsSizeGuideOpen(true)} className="text-sm text-brand-red hover:underline cursor-pointer font-bold flex items-center">
                  <span className="mr-1">📏</span> Guía de talles
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {sizes.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl border-2 font-bold transition-all ${
                      selectedSize === size 
                      ? 'border-brand-dark bg-brand-dark text-white' 
                      : 'border-gray-200 text-gray-600 hover:border-brand-dark hover:text-brand-dark'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Color */}
            {colors.length > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Seleccionar Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center px-4 py-2.5 rounded-xl border-2 font-bold transition-all text-sm ${
                        selectedColor === color 
                        ? 'border-brand-dark bg-brand-dark text-white shadow-md' 
                        : 'border-gray-200 text-gray-600 hover:border-brand-dark hover:text-brand-dark bg-white'
                      }`}
                    >
                      <span 
                        className={`w-4 h-4 rounded-full mr-2 border ${selectedColor === color ? 'border-white/50' : 'border-gray-300'}`} 
                        style={{ backgroundColor: color.toLowerCase() }}
                      ></span>
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Calculador de Envío */}
            <div className="mb-8 bg-blue-50/50 rounded-2xl border border-blue-100 p-5">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Truck className="mr-2 text-blue-600" size={20} /> Calcula tu Envío
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Tu Código Postal (Ej: 5300)" 
                    value={zipInput}
                    onChange={(e) => {
                      setZipInput(e.target.value);
                      setCalculatedShipping(null);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleCalculateShipping()}
                    className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <button 
                  onClick={handleCalculateShipping}
                  className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Calcular
                </button>
              </div>
              
              {calculatedShipping !== null && (
                <div className="mt-4 p-3 bg-white rounded-xl border border-blue-100 flex justify-between items-center animate-fade-in">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">
                      Envío a {zipInput === '5300' ? 'La Rioja (Capital)' : 'Resto del País'}
                    </span>
                    <span className="text-xs text-gray-500">Recíbelo en tu domicilio o sucursal</span>
                  </div>
                  <span className="font-black text-blue-700 text-lg">
                    ${calculatedShipping.toLocaleString('es-AR')}
                  </span>
                </div>
              )}
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md p-4 border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:relative md:border-none md:shadow-none md:p-0 md:bg-transparent z-40">
              <button 
                onClick={handleAddToCart}
                className="btn-primary w-full py-4 md:py-5 text-xl flex justify-center items-center h-14 md:h-16 shadow-lg shadow-red-500/30 hover:shadow-red-500/50"
              >
                <ShoppingBag size={24} className="mr-3" />
                Agregar al Carrito
              </button>
              <p className="hidden md:block text-center text-sm text-gray-500 mt-4">Pago seguro. Envío inmediato en La Rioja.</p>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold font-montserrat text-brand-dark">También te podría gustar</h2>
              <div className="h-1 flex-1 bg-gray-100 ml-6 rounded-full overflow-hidden hidden sm:block">
                <div className="h-full bg-brand-red w-24"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map(related => {
                const rFinalPrice = related.discount > 0 ? (related.price * (1 - related.discount / 100)) : related.price;
                
                return (
                  <Link to={`/product/${related.id}`} key={related.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img src={related.image_url} alt={related.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                      {related.discount > 0 && (
                        <div className="absolute top-2 left-2 bg-brand-red text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm">
                          -{related.discount}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-grow">
                      <span className="text-[10px] text-gray-500 mb-1">{related.brand}</span>
                      <h3 className="text-sm font-bold text-gray-900 leading-tight mb-2 group-hover:text-brand-red transition-colors line-clamp-2">{related.name}</h3>
                      <div className="mt-auto pt-2">
                        <span className="text-base font-black text-brand-dark">
                          ${rFinalPrice.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
      
      <SizeGuide isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductDetail;
