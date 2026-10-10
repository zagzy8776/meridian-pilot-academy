'use client';
import { useState } from 'react';
import { BRAND } from '@/lib/brand';
export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="wrap nav">
        <a className="logo" href="/" aria-label={`${BRAND.name}, home page`}>
          <span className="mark" aria-hidden="true">✈</span>
          <span className="name">{BRAND.name}</span>
          <span className="pill">Confidential</span>
        </a>
        <button className="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Close' : 'Menu'}
        </button>
        <nav aria-label="Main">
          <ul className={'links' + (open ? ' open' : '')}>
            <li><a href="/#top">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/team">Team</a></li>
            <li><a href="/programs">Programs</a></li>
            <li><a href="/program-details">Curriculum</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a className="btn btn-sm" href="/apply">Apply Now</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

