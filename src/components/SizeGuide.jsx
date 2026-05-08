import React, { useState } from 'react';
import { X, Ruler, ArrowRight } from 'lucide-react';

const SIZE_DATA = {
  hombre: {
    calzado: [
      { arg: '38', cm: '24.5', us: '7.5', eur: '37.5' },
      { arg: '39', cm: '25', us: '8', eur: '38' },
      { arg: '40', cm: '26', us: '9', eur: '39' },
      { arg: '41', cm: '26.5', us: '9.5', eur: '39.5' },
      { arg: '42', cm: '27', us: '10', eur: '40' },
      { arg: '43', cm: '28', us: '11', eur: '41' },
      { arg: '44', cm: '28.5', us: '11.5', eur: '41.5' },
      { arg: '45', cm: '29.5', us: '12', eur: '42.5' }
    ],
    ropa_superior: [
      { talle: 'S', pecho: '88-96', cintura: '73-81', cadera: '88-96' },
      { talle: 'M', pecho: '96-104', cintura: '81-89', cadera: '96-104' },
      { talle: 'L', pecho: '104-112', cintura: '89-97', cadera: '104-112' },
      { talle: 'XL', pecho: '112-124', cintura: '97-109', cadera: '112-120' },
      { talle: 'XXL', pecho: '124-136', cintura: '109-121', cadera: '120-128' }
    ],
    ropa_inferior: [
      { talle: 'S', cintura: '73-81', cadera: '88-96', largo_pierna: '82.5' },
      { talle: 'M', cintura: '81-89', cadera: '96-104', largo_pierna: '83' },
      { talle: 'L', cintura: '89-97', cadera: '104-112', largo_pierna: '83.5' },
      { talle: 'XL', cintura: '97-109', cadera: '112-120', largo_pierna: '84' },
      { talle: 'XXL', cintura: '109-121', cadera: '120-128', largo_pierna: '84.5' }
    ]
  },
  mujer: {
    calzado: [
      { arg: '35', cm: '22.5', us: '5.5', eur: '35.5' },
      { arg: '36', cm: '23', us: '6', eur: '36' },
      { arg: '37', cm: '24', us: '7', eur: '37' },
      { arg: '38', cm: '24.5', us: '7.5', eur: '37.5' },
      { arg: '39', cm: '25', us: '8', eur: '38' },
      { arg: '40', cm: '26', us: '9', eur: '39' },
      { arg: '41', cm: '26.5', us: '9.5', eur: '39.5' }
    ],
    ropa_superior: [
      { talle: 'XS', pecho: '76-83', cintura: '60-67', cadera: '84-91' },
      { talle: 'S', pecho: '83-90', cintura: '67-74', cadera: '91-98' },
      { talle: 'M', pecho: '90-97', cintura: '74-81', cadera: '98-105' },
      { talle: 'L', pecho: '97-104', cintura: '81-88', cadera: '105-112' },
      { talle: 'XL', pecho: '104-114', cintura: '88-98', cadera: '112-120' }
    ],
    ropa_inferior: [
      { talle: 'XS', cintura: '60-67', cadera: '84-91', largo_pierna: '79.5' },
      { talle: 'S', cintura: '67-74', cadera: '91-98', largo_pierna: '80' },
      { talle: 'M', cintura: '74-81', cadera: '98-105', largo_pierna: '80.5' },
      { talle: 'L', cintura: '81-88', cadera: '105-112', largo_pierna: '81' },
      { talle: 'XL', cintura: '88-98', cadera: '112-120', largo_pierna: '81.5' }
    ]
  },
  niños: {
    calzado: [
      { arg: '28', cm: '17', us: '11C', eur: '28' },
      { arg: '29', cm: '18', us: '12C', eur: '29.5' },
      { arg: '30', cm: '18.5', us: '12.5C', eur: '30' },
      { arg: '31', cm: '19', us: '13C', eur: '31' },
      { arg: '32', cm: '20', us: '1Y', eur: '32' },
      { arg: '33', cm: '20.5', us: '1.5Y', eur: '33' },
      { arg: '34', cm: '21.5', us: '2.5Y', eur: '34' }
    ],
    ropa_superior: [
      { talle: 'S (8-10)', altura: '128-140', pecho: '64-69', cintura: '59-61' },
      { talle: 'M (10-12)', altura: '140-152', pecho: '69-75', cintura: '61-65' },
      { talle: 'L (12-13)', altura: '152-158', pecho: '75-81', cintura: '65-69' },
      { talle: 'XL (13-15)', altura: '158-170', pecho: '81-89', cintura: '69-73' }
    ],
    ropa_inferior: [
      { talle: 'S (8-10)', altura: '128-140', cintura: '59-61', cadera: '68-74' },
      { talle: 'M (10-12)', altura: '140-152', cintura: '61-65', cadera: '74-79' },
      { talle: 'L (12-13)', altura: '152-158', cintura: '65-69', cadera: '79-84' },
      { talle: 'XL (13-15)', altura: '158-170', cintura: '69-73', cadera: '84-89' }
    ]
  }
};

const CATEGORIES = [
  { id: 'hombre', label: 'Hombre' },
  { id: 'mujer', label: 'Mujer' },
  { id: 'niños', label: 'Niños' }
];

const CLOTHING_TYPES = [
  { id: 'calzado', label: 'Calzado' },
  { id: 'ropa_superior', label: 'Ropa Superior' },
  { id: 'ropa_inferior', label: 'Ropa Inferior' }
];

const SizeGuide = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('hombre');
  const [activeType, setActiveType] = useState('calzado');

  if (!isOpen) return null;

  const currentData = SIZE_DATA[activeCategory][activeType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose}></div>

      {/* Modal Drawer Content */}
      <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden transform transition-all">
        
        {/* Header */}
        <div className="bg-brand-dark px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 text-white">
            <Ruler className="w-6 h-6 text-brand-red" />
            <h2 className="text-xl md:text-2xl font-extrabold font-montserrat uppercase tracking-tight" id="modal-title">
              Guía de Talles
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full p-2">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50 flex flex-col md:flex-row gap-8">
          
          {/* Controles Laterales */}
          <div className="w-full md:w-64 shrink-0 space-y-6">
            
            {/* Categoría */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Para quién</h3>
              <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex-1 md:w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                      activeCategory === cat.id 
                      ? 'bg-brand-red text-white shadow-lg shadow-red-500/30' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo de Prenda */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Qué buscas</h3>
              <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {CLOTHING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveType(type.id)}
                    className={`flex-1 md:w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center justify-between ${
                      activeType === type.id 
                      ? 'bg-brand-dark text-white shadow-lg shadow-black/20' 
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {type.label}
                    {activeType === type.id && <ArrowRight size={16} className="hidden md:block text-brand-red" />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Tabla de Medidas */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-black text-gray-900 font-montserrat uppercase">
                {CATEGORIES.find(c => c.id === activeCategory)?.label} <span className="text-brand-red">/</span> {CLOTHING_TYPES.find(c => c.id === activeType)?.label}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Todas las medidas están en centímetros (cm).</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(currentData[0]).map((key, index) => (
                      <th key={key} className={`py-4 px-4 text-xs font-black text-gray-600 uppercase tracking-wider ${index === 0 ? 'bg-gray-200 text-brand-dark' : ''}`}>
                        {key.replace('_', ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      {Object.values(row).map((val, index) => (
                        <td key={index} className={`py-4 px-4 text-sm font-medium ${index === 0 ? 'bg-gray-50 font-black text-gray-900 border-r border-gray-100' : 'text-gray-700'}`}>
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Hint / Helper */}
            <div className="mt-auto p-4 bg-red-50 text-red-800 text-xs font-medium md:rounded-b-2xl border-t border-red-100">
              <span className="font-bold text-brand-red">Tip:</span> Si tus medidas están entre dos talles, te recomendamos elegir el talle más grande para un calce más holgado, o el más pequeño si prefieres un ajuste más ceñido.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
