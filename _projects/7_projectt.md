---
layout: page
title: Intelligent Avatar
description: Digital Tour guide that can be found around airports.
img: assets/img/saudigpt.jpg
importance: 3
category: ""
---

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/saudichatheader.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>

#### Project outline

<p>Hackathon project. When OpenAI first released API keys for ChatGPT, the Ministry of Communication and Information Technology ran a hackathon under the theme of using the technology to serve a national use case. <a href="https://tuwaiq.hackathon.sa/">Hackathon page</a>. </p>

<p>
The idea was to build an avatar that would sit on a large advertisment screen (<a href="https://www.google.com/search?q=indoor+advertising+display+screen&tbm=isch&ved=2ahUKEwiGhqTJ_7CAAxWxsEwKHZbEAI8Q2-cCegQIABAA&oq=indoor+advertising+&gs_lcp=CgNpbWcQARgBMgUIABCABDIFCAAQgAQyBQgAEIAEMgUIABCABDIFCAAQgAQyBQgAEIAEMgQIABAeMgYIABAFEB4yBggAEAUQHjIGCAAQCBAeOgQIIxAnOggIABCABBCxAzoICAAQsQMQgwE6BwgAEIoFEEM6CwgAEIAEELEDEIMBULUDWPEhYLMxaABwAHgAgAGoAYgBvhaSAQQwLjIwmAEAoAEBqgELZ3dzLXdpei1pbWfAAQE&sclient=img&ei=_H3DZIaYKrHhsgKWiYP4CA&bih=786&biw=1536#imgrc=Z_BxTjhYwjbt0M">similar to these</a>), that could be found as someone was waiting for thier laugadge at the airport. The avatar would be able to conversate with users fluently. Through a digital avatar interface.
</p>

The technology used:

- Whisper AI: Transcribes what is spoken to the avatar into text.
- GPT-3.5: Initiated and fine-tuned to behave as a tour guide, specifically focused on Saudi Arabia.
- Google Text-to-Speech: To speak out the responses on ChatGPT.
- UI*: Not integrated, but will need to rig a character and render to match responses.

<p>
As proof of concept, the avatars presented in the project pitch is a product of movio.la studio. However, the goal of the project is to have a fixed set of in-house developed avatars.
</p>


<center>
<h5>Working code demo</h5>
</center>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/Intelligent Avatar Saudi ChatGPT Hackathon.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>
<div class="caption" style="margin-top: -15px;">
    *Video is sped up for better representation.
</div>

<center>
<h5>End product concept demo.</h5>
</center>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/Intelligent Avatar by Whisper and ChatGPT.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>

