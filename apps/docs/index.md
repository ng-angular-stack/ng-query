---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: '@ng-query'
  text: 'Server state management tool with Angular DX first'
  tagline: Simply create comfortable and awesome UX effortlessly in no time, that can be adapted to all of your needs
  image:
    src: /assets/ng-query-logo.png
    alt: ng-query logo

  actions:
    - theme: brand
      text: Get started
      link: /get-started
    - theme: alt
      text: Examples
      link: /examples/overview

features:
  - title: Query
    details: Effortlessly manage server data with smart caching, request status tracking, and global queries for a seamless user experience.
  - title: Mutation
    details: Update your data with powerful mutation tools, including optimistic updates and automatic state synchronization for instant feedback.
  - title: Designed for Signal Store
    details: Fully compatible and easily integrated with NgRx SignalStore, providing type safety, autocompletion, and high performance.
---

<div class="demo-section">
  <h2 class="demo-title">Teaser 🎥</h2>
  <video controls muted loop width="800" preload="none" poster="/assets/ng-query-v1.jpg" loading="lazy" class="demo-video">
    <source src="/assets/ng-query-v1.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
</div>

<style>
@media (min-width: 600px) {
  .demo-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
  }
  .demo-title {
    margin-bottom: 1.5rem;
    margin-top: 0;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
  .demo-video {
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    max-width: 800px;
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
