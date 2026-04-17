---
id: pi07-steerable-model-emergent-capabilities
type: blog
title: "π0.7: a Steerable Model with Emergent Capabilities"
year: 2026
date_published: 2026-04-16
venue: Physical Intelligence Blog
categories:
  - Robotics
  - VLA
  - Foundation Models
keywords:
  - robotics
  - vision-language-action
  - generalization
  - compositional generalization
  - cross-embodiment transfer
  - steerable model
source_url: https://www.pi.website/blog/pi07
canonical_url: https://physicalintelligence.company/blog/pi07
added_at: 2026-04-17
---

# π0.7: a Steerable Model with Emergent Capabilities

## 摘要
π0.7 是一个面向机器人控制的通用 vision-language-action 模型。它在灵巧操作任务上达到接近专用模型的表现，同时开始显现出更强的组合泛化能力：能根据新的语言指令完成未见任务，并能跨机器人形态迁移技能。

## 总结
这篇文章介绍了 Physical Intelligence 的新一代模型 π0.7。相比以往往往需要为某类任务单独训练 specialist policy 的方法，π0.7 更像一个通用机器人基础模型。它能在洗衣折叠、做咖啡、组装盒子、厨房操作等多类任务中保持较强表现，还能在没有针对特定任务专门收集示范的条件下，根据语言指导去尝试完成新任务。

作者强调，泛化能力的提升不只是因为数据规模变大，更关键的是训练时把“做什么”和“怎么做”都编码进 prompt 中。模型输入不仅有任务语言描述，还包括速度/质量等元数据、控制模态标签，以及视觉子目标图像。这让来自不同机器人、不同质量、不同控制方式的数据能够在统一框架下被有效吸收。

文章展示了几个有代表性的能力：
- 使用逐步语言指导去完成新 appliance task（如空气炸锅）
- 将已有技能组合成新任务执行策略
- 在不同机器人 embodiment 之间迁移能力
- 在多个需要高灵巧性的任务上达到接近专用强化学习策略的效果

## 创新点
1. 单模型统一多种机器人任务，而不是每个任务单独微调 specialist。
2. 用多模态 prompt 条件化不同来源的数据，显式区分行为策略、质量和执行方式。
3. 展示组合泛化迹象，特别是在未专门训练的新任务上通过语言 coaching 获得执行能力。
4. 展示跨 embodiment transfer，说明模型学习到的不是简单动作复现，而是更抽象的技能表示。
5. 融合 RL specialist 数据蒸馏结果，让通用模型兼顾泛化与高性能。

## 原文链接
- 博客：https://www.pi.website/blog/pi07
- Canonical：https://physicalintelligence.company/blog/pi07

## 备注
页面中提到附带 π0.7 PDF，但本次先以官方博客正文作为首篇收录内容。
