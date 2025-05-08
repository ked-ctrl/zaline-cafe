"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight, Maximize2, Heart, Share2, Download, ChevronDown } from "lucide-react"

// Updated gallery images with correct path
const galleryImages = [
  {
    src: "/images/gallerySection/galleryImage1.jpg",
    alt: "Coffee brewing process",
    caption: "Our signature brewing process",
    category: "brewing",
  },
  {
    src: "/images/gallerySection/galleryImage2.jpg",
    alt: "Latte art",
    caption: "Award-winning latte art",
    category: "art",
  },
  {
    src: "/images/gallerySection/galleryImage3.jpg",
    alt: "Coffee beans",
    caption: "Freshly roasted beans",
    category: "beans",
  },
  {
    src: "/images/gallerySection/galleryImage4.jpg",
    alt: "Café interior",
    caption: "Our cozy interior",
    category: "space",
  },
  {
    src: "/images/gallerySection/galleryImage5.jpg",
    alt: "Pastries display",
    caption: "Freshly baked pastries",
    category: "food",
  },
  {
    src: "/images/gallerySection/galleryImage6.jpg",
    alt: "Barista at work",
    caption: "Our skilled baristas",
    category: "people",
  },
]

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [filter, setFilter] = useState<string>("all")
  const [isLoaded, setIsLoaded] = useState(false)
  const [lightboxThumbnails, setLightboxThumbnails] = useState(false)
  const galleryRef = useRef<HTMLDivElement>(null)
  
  // Set of unique categories for filter
  const categories = ["all", ...Array.from(new Set(galleryImages.map(img => img.category)))]
  
  // Filtered images based on selected category
  const filteredImages = filter === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === filter)
  
  useEffect(() => {
    setIsLoaded(true)
    
    // Handle keyboard navigation in lightbox
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return
      
      if (e.key === "Escape") {
        setSelectedImage(null)
      } else if (e.key === "ArrowRight") {
        setSelectedImage(prev => 
          prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === "ArrowLeft") {
        setSelectedImage(prev => 
          prev !== null && prev > 0 ? prev - 1 : prev
        )
      }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedImage])
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }
  
  const staggerDelay = 0.15
  
  return (
    <section className="py-24 bg-gradient-to-b from-amber-50 to-white" id="gallery">
      <div className="container px-4 md:px-6 mx-auto">
        {/* Section Header with Refined Design */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <span className="text-amber-600 font-medium text-sm uppercase tracking-widest mb-2">
              Visual Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 text-center">
              Our Coffee <span className="text-amber-700">Experience</span>
            </h2>
            <div className="h-1 w-24 bg-amber-500 mt-4 rounded-full"></div>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto text-center leading-relaxed">
              Step into the world of Zelin Café through our gallery. Experience the ambiance, craftsmanship, and passion
              that goes into every cup we serve.
            </p>
          </motion.div>
          
          {/* Category Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-wrap justify-center mt-10 gap-2"
          >
            {categories.map((category, index) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === category 
                    ? 'bg-amber-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Gallery Grid with Masonry-inspired Layout */}
        <div className="relative overflow-hidden" ref={galleryRef}>
          <AnimatePresence mode="wait">
            <motion.div
              key={filter}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-7xl"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gridAutoRows: "minmax(250px, auto)",
                gridAutoFlow: "dense"
              }}
            >
              {filteredImages.map((image, index) => (
                <motion.div
                  key={`${filter}-${index}`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-lg shadow-lg cursor-pointer group ${
                    index % 3 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
                  }`}
                  style={{
                    gridRow: index % 5 === 0 ? "span 2" : "span 1",
                    gridColumn: index % 3 === 0 ? "span 2" : "span 1"
                  }}
                  onClick={() => setSelectedImage(galleryImages.findIndex(img => img.src === image.src))}
                >
                  <div className="h-full w-full relative">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          {image.caption}
                        </h3>
                        <p className="text-white/80 text-sm mt-1 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                          {image.category.charAt(0).toUpperCase() + image.category.slice(1)}
                        </p>
                      </div>
                      <div className="absolute top-4 right-4">
                        <button className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white opacity-0 transform translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/30">
                          <Maximize2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Enhanced Lightbox with Controls */}
        <AnimatePresence>
          {selectedImage !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
              onClick={() => setSelectedImage(null)}
            >
              {/* Lightbox Header */}
              <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent z-10">
                <div className="text-white">
                  <h3 className="font-medium text-lg">Zelin Café Gallery</h3>
                  <p className="text-sm text-white/70">
                    {selectedImage + 1} of {galleryImages.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                  <button 
                    className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button 
                    className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button
                    className="ml-2 p-2 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage(null)
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Main Image */}
              <div className="relative h-full max-h-[80vh] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative max-w-5xl max-h-[80vh]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={galleryImages[selectedImage].src}
                      alt={galleryImages[selectedImage].alt}
                      width={1200}
                      height={800}
                      className="object-contain max-h-[70vh] rounded-md"
                      priority
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                      <h4 className="text-white text-xl font-semibold">{galleryImages[selectedImage].caption}</h4>
                      <p className="text-white/70 mt-1">{galleryImages[selectedImage].category.charAt(0).toUpperCase() + galleryImages[selectedImage].category.slice(1)}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Navigation Arrows */}
                <button
                  className="absolute left-4 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(prev => (prev !== null && prev > 0 ? prev - 1 : prev))
                  }}
                  disabled={selectedImage === 0}
                  style={{ opacity: selectedImage === 0 ? 0.5 : 1 }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  className="absolute right-4 p-3 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImage(prev => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : prev))
                  }}
                  disabled={selectedImage === galleryImages.length - 1}
                  style={{ opacity: selectedImage === galleryImages.length - 1 ? 0.5 : 1 }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              {/* Thumbnails */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex justify-between items-center mb-3">
                  <button 
                    className="text-sm text-white/80 hover:text-white flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxThumbnails(!lightboxThumbnails)
                    }}
                  >
                    {lightboxThumbnails ? "Hide Thumbnails" : "Show Thumbnails"}
                    <ChevronDown className={`h-4 w-4 transition-transform ${lightboxThumbnails ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                
                <AnimatePresence>
                  {lightboxThumbnails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                        {galleryImages.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden cursor-pointer transition-all ${
                              selectedImage === idx ? 'ring-2 ring-amber-500 ring-offset-1 ring-offset-black' : 'opacity-70 hover:opacity-100'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedImage(idx)
                            }}
                          >
                            <Image
                              src={img.src}
                              alt={img.alt}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}