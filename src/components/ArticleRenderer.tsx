'use client';

import { ArticleContentBlock } from '@/types';
import Image from 'next/image';
import React from 'react';

interface ArticleRendererProps {
  contentBlocks: ArticleContentBlock[];
}

export default function ArticleRenderer({ contentBlocks }: ArticleRendererProps) {
  const renderContentBlock = (block: ArticleContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const HeadingTag = `h${block.level || 2}` as keyof React.JSX.IntrinsicElements;
        const headingClasses = {
          1: 'text-4xl font-bold mb-6 mt-8',
          2: 'text-3xl font-bold mb-5 mt-7',
          3: 'text-2xl font-semibold mb-4 mt-6',
          4: 'text-xl font-semibold mb-3 mt-5',
          5: 'text-lg font-semibold mb-3 mt-4',
          6: 'text-base font-semibold mb-2 mt-3'
        };
        
        return (
          <HeadingTag 
            key={index}
            className={headingClasses[block.level as keyof typeof headingClasses] || headingClasses[2]}
          >
            {block.content}
          </HeadingTag>
        );

      case 'text':
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
            {block.content}
          </p>
        );

      case 'image':
        return (
          <div key={index} className="my-8">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={block.src || ''}
                alt={block.alt || ''}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              />
            </div>
            {block.caption && (
              <div className="mt-2 text-sm text-gray-600 text-center">
                {block.caption}
                {block.credit_url && (
                  <span className="ml-1">
                    <a 
                      href={block.credit_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View source
                    </a>
                  </span>
                )}
              </div>
            )}
          </div>
        );

      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 rounded-r-lg">
            <p className="text-gray-700 italic text-lg">
              &ldquo;{block.content}&rdquo;
            </p>
          </blockquote>
        );

      case 'list':
        return (
          <ul key={index} className="list-disc list-inside mb-4 space-y-2">
            {block.items?.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );

      default:
        return null;
    }
  };

  return (
    <div className="prose prose-lg max-w-none">
      {contentBlocks.map((block, index) => renderContentBlock(block, index))}
    </div>
  );
}
