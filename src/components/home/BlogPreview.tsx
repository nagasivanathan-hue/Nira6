'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { mockBlogPosts } from '@/lib/mockData';

export default function BlogPreview() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-heading font-bold text-2xl lg:text-3xl">Creator Blog</h2>
            <p className="text-nira-text-secondary mt-1">Tips, guides, and news for creators</p>
          </div>
          <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-nira-dark hover:text-nira-yellow-dark transition-colors">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockBlogPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-2xl overflow-hidden border border-nira-gray-dark hover:shadow-lg transition-all"
            >
              <div className="relative aspect-[16/10] bg-nira-gray overflow-hidden">
                <Image src={post.image} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-3 left-3 px-3 py-1 bg-nira-yellow text-nira-dark text-xs font-bold rounded-lg">{post.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-heading font-semibold text-base mb-2 group-hover:text-nira-yellow-dark transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-sm text-nira-text-secondary line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-nira-text-secondary">
                  <span>{post.author}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
