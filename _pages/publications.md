---
layout: page2
permalink: /publications/
title: publications
description:
years: [2023]
nav: true
nav_order: 1
---
<!-- keep everything as is just change header to "undergraduate">
<!-- _pages/publications.md -->
<div class="publications">

{%- for y in page.years %} 
  <h2 class="year">undergraduate</h2>
  {% bibliography -f {{ site.scholar.bibliography }} -q @*[year={{y}}]* %}
{% endfor %}

</div>
