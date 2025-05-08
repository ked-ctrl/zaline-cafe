"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Coffee, Clock, MapPin, Phone, Mail, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import Founders from "../../../public/images/gallerySection/founders.jpg"
import HeroBackground from "../../../public/images/gallerySection/aboutBG.jpg"
// Mock data for team members
const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Founder & Head Barista",
    bio: "Sarah founded Zelin Café in 2020 with a passion for quality coffee and community building. She has over 10 years of experience in specialty coffee.",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Michael Chen",
    role: "Master Roaster",
    bio: "Michael oversees our coffee bean selection and roasting process. His expertise ensures that every cup of Zelin coffee has the perfect flavor profile.",
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    name: "Emily Rodriguez",
    role: "Pastry Chef",
    bio: "Emily creates all our delicious pastries and desserts. Her creative approach combines traditional techniques with innovative flavors.",
    image: "/placeholder.svg?height=400&width=400",
  },
]

// Mock data for testimonials
const testimonials = [
  {
    name: "David Wilson",
    text: "Zelin Café has the best cappuccino in town! The atmosphere is cozy and the staff is always friendly. It's my go-to spot for both work and relaxation.",
    rating: 5,
  },
  {
    name: "Jessica Lee",
    text: "I love their pastries, especially the croissants. Everything is freshly baked and you can taste the quality. The coffee is exceptional too!",
    rating: 5,
  },
  {
    name: "Robert Taylor",
    text: "Great place to work remotely. The wifi is reliable, the coffee keeps coming, and the ambient noise is just right. Highly recommend!",
    rating: 4,
  },
]

export default function AboutPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-12 md:py-24 bg-gradient-to-b from-amber-200/60 to-amber-700/90 text-white">
          {/* Background Image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src={HeroBackground}
              alt="Coffee beans background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/30" />
          </div>
          
          <div className="container px-4 md:px-6 mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">About Zelin Café</h1>
              <p className="mt-4 text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
                Our story, our passion, and our commitment to exceptional coffee experiences.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-12 md:py-24 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Story</h2>
                <div className="mt-4 space-y-4 text-sm md:text-base">
                  <p>
                    Founded in 2020, Zelin Café was born from a simple passion: to create a space where quality coffee
                    brings people together.
                  </p>
                  <p>
                    What started as a small corner shop has grown into a beloved community hub, where every cup is
                    crafted with care and every customer is welcomed like family.
                  </p>
                  <p>
                    We source our beans ethically from small-scale farmers around the world, ensuring that every step
                    from farm to cup maintains our commitment to quality and sustainability.
                  </p>
                  <p>
                    At Zelin Café, we believe that great coffee is an art form - one that we're proud to share with our
                    community every day.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-64 md:h-[400px] w-full rounded-lg overflow-hidden order-1 md:order-2"
              >
                <Image
                  src={Founders}
                  alt="Zelin Café interior"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="py-12 md:py-24 bg-gradient-to-b from-amber-100 to-amber-50">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Our Values</h2>
              <p className="mt-4 text-gray-600 text-sm md:text-base">
                The principles that guide everything we do at Zelin Café.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-amber-600 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <Coffee className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center">
                      We never compromise on quality. From bean selection to brewing techniques, excellence is our
                      standard.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-amber-600 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-white"
                      >
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                        <path d="m7 10 3 3 7-7"></path>
                      </svg>
                    </div>
                    <CardTitle>Sustainability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center">
                      We're committed to ethical sourcing, eco-friendly practices, and supporting the communities that
                      grow our coffee.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <Card>
                  <CardHeader className="text-center">
                    <div className="mx-auto bg-amber-600 p-2 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-white"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                    </div>
                    <CardTitle>Community</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center">
                      We create spaces where people connect, collaborate, and feel at home. Our café is more than a
                      business—it's a community hub.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-12 md:py-24 bg-gradient-to-b from-amber-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">What Our Customers Say</h2>
              <p className="mt-4 text-gray-600 text-sm md:text-base">
                Don't just take our word for it - hear from our community.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="italic mb-4">"{testimonial.text}"</p>
                      <p className="font-semibold">- {testimonial.name}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Visit Us Section */}
        <section className="py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col md:grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 md:order-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Visit Us</h2>
                <div className="mt-6 space-y-4 text-sm md:text-base">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Address</h3>
                      <p>F2F4+576, Lombos St, Parañaque, 1700 Metro Manila</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Hours</h3>
                      <p>Monday - Friday: 6am - 8pm</p>
                      <p>Saturday - Sunday: 7am - 9pm</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Phone</h3>
                      <p>0949 944 1715</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p>hello@zelincafe.com</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <Button className="bg-amber-600 hover:bg-amber-700 w-full md:w-auto">
                    <a 
                      href="https://www.google.com/maps/place/F2F4%2B576+Lombos+St,+Para%C3%B1aque,+Metro+Manila" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      Get Directions
                    </a>
                  </Button>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative h-64 md:h-[400px] w-full rounded-lg overflow-hidden order-1 md:order-2"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3863.201201201201!2d121.012315315343!3d14.476000789900001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397ce2f8c1d5b5b%3A0x1b0b0b0b0b0b0b0b!2sF2F4%2B576%20Lombos%20St%2C%20Para%C3%B1aque%2C%201700%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1633080000000!5m2!1sen!2sph"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  className="rounded-lg"
                ></iframe>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

