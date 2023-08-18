---
layout: page
title: LeMAC Project
description: AI Agents taught using RL in Unity
img: assets/img/lemacprojectthumbnail.jpg
importance: 3
category: ""
---
#### Project outline

<p>Lem (the camel) was taught using two methods, Ray Perseption (similar to LiDAR), and Vision (using cameras as input). </p>

<p>This project involved working with the Unity game engine, specifically the ML-Agents package. The main focus of this project was to acquire some experience in the Unity game engine and to develop an engaging application of Reinforcement Learning.
</p>

##### Ray Perseption
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/lemlidar.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>
<div class="caption" style="margin-top: -10px;">
    Demo of Lem using Ray Perception
</div>


<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/trainingdemolidar.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>
<div class="caption" style="margin-top: -10px;">
    Training Process
</div>
<p>Since the maximum award the agent can get is 1. When the Mean Reward reached 0.96 it is expected that the agent has fully learnt the task.
</p>
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.html path="assets/img/CAMEL-TRAINING.jpg" title="example image" class="img-fluid rounded z-depth-1" %}
    </div>
</div>
<div class="caption" style="margin-top: -10px;">
    Agents Performance During Training
</div>


##### Vision
A few things have been changed here. The sphere light that indicated how training progress is going has been removed. This change was made because the light could potentially introduce nuances that distract the agent from learning, as it represented irrelevant features. Another adjustment has been made to the platform's color to enhance distinguishability.

The input provided to the agent is from a camera with dimensions of 64x64.

Only 4 training environments were utilized, as processing images and utilizing vision is more computationally expensive.
<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/Camel_Vis_Train.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>
<div class="caption" style="margin-top: -10px;">
    Training Process
</div>

<div class="row">
    <div class="col-sm mt-3 mt-md-0">
        {% include video.html path="assets/video/Camel_Vis_run.mp4" class="img-fluid rounded z-depth-1" controls=true autoplay=false %}
    </div>
</div>
<div class="caption" style="margin-top: -10px;">
    Running inference with the trained model
</div>

##### Future work

The objective is to enable agents to perform more complex tasks.

One idea is to simulate a real-world environment (such as a physical room) and have agents accomplish tasks within it. Subsequently, the knowledge gained could be transferred to an IoT setup or a robot for task execution.