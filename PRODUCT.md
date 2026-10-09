# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + Tailwind + Motion, deployed on Vercel (Hobby/free). Supabase (free) for database and admin auth. ImageKit (free, no credit card) for product photos; the user declined Cloudflare because it asks for a card. Confirmed by the user. All three must stay inside free-tier limits: store pages are statically generated and revalidated on demand, Vercel image optimization is off, photos are compressed in the browser before upload.

## Users

- **Shoppers**: people in the Federal District (DDD 61) and across Brazil who follow @imperiodascapinhas25 on Instagram (22.7k followers) or walk past the physical store, mostly on a phone, looking for a case or accessory for a specific phone model, very often an iPhone.
- **Shopkeeper (lojista)**: the store owner/staff, who registers products, photos, prices and Mercado Livre links in an admin panel, usually between customers, from a phone or the shop computer.

## Product Purpose

An online showcase for Império das Capinhas, a phone-accessories store (capinhas, acessórios & assistência técnica). The site shows the store's own product photos, prices and descriptions; checkout happens on Mercado Livre. Success = visitors click "Comprar no Mercado Livre" (tracked per product) or ask on WhatsApp.

## Positioning

A real, physical store with walls full of cases ("referência em capas Apple"), shipping to all of Brazil. The site shows the store's own photos of the real stock, not marketplace catalog shots, and Mercado Livre handles payment so buying feels safe.

## Operating Context

- Two hosts, one Next.js app: root domain = public store; `admin.` subdomain = shopkeeper panel (configurable by env var; works on .vercel.app before a domain exists).
- Buy flow: product page → "Comprar no Mercado Livre" button (states that the purchase is completed on Mercado Livre) → opens the ML listing in a new tab. Secondary: WhatsApp with a prefilled message naming the product.
- Admin flow: log in (Supabase email/password, sign-ups disabled), create/edit product: title, multiple photos (reorderable), price, optional "de" price, description, category, compatible phone models, ML link, featured/active flags. Store settings: WhatsApp, Instagram, address, hours.

## Capabilities and Constraints

- Per-product "buy click" counter shown in the admin.
- "De/por" pricing (optional compare-at price).
- Physical store section with real store photos and address.
- Free-tier budget is a hard constraint (Vercel bandwidth/invocations, Supabase 500MB DB + egress + 7-day inactivity pause, ImageKit ~20 GB bandwidth / ~3 GB storage per month).
- Undecided: final domain name; exact street address (to be filled in admin settings).

## Brand Commitments

- Name: **Império das Capinhas**. Tagline on signage: "Capinhas, acessórios & assistência técnica" (the store does not sell wholesale online).
- Logo: black crown over a phone outline, on yellow; heavy black sans wordmark with white outline. Yellow + black is the recognizable identity (storefront sign, Instagram avatar).
- Brands carried (from signage): Apple, Samsung, Motorola, Xiaomi, Realme, LG, Asus.
- Voice from Instagram: direct, informal, Brazilian Portuguese ("Compre com a gente", "Enviamos para todo Brasil").
- Contact (current, from Instagram + storefront): Instagram @imperiodascapinhas25, WhatsApp (61) 99312-5211. An older card shows @imperiodascapinhas78 / (61) 99350-8387; treat as legacy.

## Evidence on Hand

- Logo: attached image 6 (raster, yellow background).
- Store photos: interior walls of cases, Apple silicone case wall, counter with premium cases, storefront sign (attached images 1, 2, 3, 4, 7, 8).
- Instagram: 525 posts, 22.7k followers, ships to all of Brazil.
- No testimonials, ratings, sales numbers or reviews are on hand; do not invent them.

## Product Principles

1. The store's real stock and real photos are the proof; show them big.
2. Every product view ends in one obvious action: buy on Mercado Livre.
3. Find-by-phone-model beats browse-by-category.
4. The shopkeeper must be able to publish a product in under two minutes from a phone.
5. Stay free: cache everything public, keep images small.
