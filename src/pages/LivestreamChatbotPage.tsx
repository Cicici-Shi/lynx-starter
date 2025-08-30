// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import { useEffect, useState } from "@lynx-js/react";
import { Icon } from "../components/Icon.tsx";
import { LivestreamRecords } from "../components/LivestreamRecords.tsx";
import { ChatInterface } from "../components/ChatInterface.tsx";
import { chatbotAIService } from "../services/aiService.ts";
import type {
  ChatMessage,
  ErrorState,
  LivestreamRecord,
  RevenueDistribution,
  MessageSegment,
} from "../types/chatbot.ts";
import type { LivestreamChatbotPageProps } from "../types/components.ts";
import "./LivestreamChatbotPage.css";
import "../components/ChatInterface.css";
import "../components/LivestreamSelectionMessage.css";
import "../components/StreamingBotMessage.css";
import "../components/TypewriterBotMessage.css";

/**
 * Live Revenue Distribution Chatbot Main Page Component
 *
 * Features:
 * - Display recent live stream records
 * - Support expanding revenue distribution details
 * - Provide chat interface for AI interaction
 * - Unified state management and error handling
 */
export function LivestreamChatbotPage({
  onBack,
  onNavigateToReports,
}: LivestreamChatbotPageProps) {
  // === State Management ===

  // Livestream records related state
  const [livestreamRecords, setLivestreamRecords] = useState<
    LivestreamRecord[]
  >([]);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [revenueDistributions, setRevenueDistributions] = useState<
    Map<string, RevenueDistribution>
  >(new Map());

  // Chat related state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<number>(0);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  // === Data Initialization ===

  useEffect(() => {
    initializeData();
  }, []);

  /**
   * Set default welcome message and livestream record selection
   */
  const setDefaultWelcomeMessage = (records?: LivestreamRecord[]) => {
    const messages: ChatMessage[] = [];

    // If there are livestream records, add selection message
    if (records && records.length > 0) {
      const selectionMessage: ChatMessage = {
        id: "livestream-selection-1",
        type: "livestream-selection",
        content:
          "Hello! I’m Fairtok’s Live Revenue Assistant, helping creators achieve fair and transparent earnings. Ask me about distribution rules, calculations, or view detailed performance for any stream. Below is a summary of recent live streams—click any entry for in-depth recommendations and strategies to balance current earnings with future growth.",
        timestamp: new Date(),
        livestreamRecords: records,
      };
      messages.push(selectionMessage);
    }

    setChatMessages(messages);
  };

  /**
   * Initialize page data
   * Load livestream records and revenue distribution information
   */
  const initializeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate data loading
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Use complete mock data
      const { mockLivestreamRecords, mockRevenueDistributions } = await import(
        "../data/mockData.js"
      );

      // Take only the first 3 latest records for display
      const mockRecords = mockLivestreamRecords.slice(0, 3);

      // Create revenue distribution data mapping
      const mockDistributions = new Map<string, RevenueDistribution>();
      mockRevenueDistributions.forEach((distribution) => {
        mockDistributions.set(distribution.recordId, distribution);
      });

      setLivestreamRecords(mockRecords);
      setRevenueDistributions(mockDistributions);

      // Set welcome message and livestream record selection
      setDefaultWelcomeMessage(mockRecords);
    } catch (err) {
      console.error("Data initialization failed:", err);
      setError({
        type: "data",
        message: "Failed to load data, please try again later",
        retryable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // === Event Handlers ===

  /**
   * Handle livestream record click event
   * Expand or collapse revenue distribution details
   */
  const handleRecordClick = (recordId: string) => {
    if (expandedRecordId === recordId) {
      // If clicked record is already expanded, collapse it
      setExpandedRecordId(null);
    } else {
      // Expand the new record
      setExpandedRecordId(recordId);
    }
  };

  /**
   * Handle revenue details collapse event
   */
  const handleRecordCollapse = () => {
    setExpandedRecordId(null);
  };

  /**
   * Handle livestream record selection event
   * Triggered when user clicks on a livestream record in the chat interface
   */
  const handleRecordSelect = async (record: LivestreamRecord) => {
    try {
      // Add user selection message
      const userSelectionMessage: ChatMessage = {
        id: `user-selection-${Date.now()}`,
        type: "user",
        content: `I want to understand the revenue distribution for "${record.title}"`,
        timestamp: new Date(),
        relatedRecordId: record.id,
      };

      setChatMessages((prev) => [...prev, userSelectionMessage]);
      setIsThinking(true);

      // Get revenue distribution data
      const distribution = revenueDistributions.get(record.id);
      if (!distribution) {
        throw new Error(
          "Revenue distribution data not found for this livestream"
        );
      }

      // Generate AI analysis response
      const analysisResponse = await chatbotAIService.explainRevenue(
        record.id,
        distribution
      );

      const botAnalysisMessage: ChatMessage = {
        id: `bot-analysis-${Date.now()}`,
        type: "bot",
        content: analysisResponse,
        timestamp: new Date(),
        relatedRecordId: record.id,
        metadata: {
          confidence: 0.95,
          sources: [
            `Livestream Record-${record.id}`,
            "Revenue Distribution Data",
          ],
        },
      };

      setChatMessages((prev) => [...prev, botAnalysisMessage]);
    } catch (error) {
      console.error("Failed to handle livestream record selection:", error);

      const errorMessage: ChatMessage = {
        id: `error-selection-${Date.now()}`,
        type: "bot",
        content:
          "Sorry, there was a problem retrieving the revenue distribution information for this livestream. Please try again later or select another livestream record.",
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Handle send message event
   * Add user message and trigger AI reply
   */
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isThinking) {
      return;
    }

    const userMessageContent = content.trim();

    // Message length validation
    if (userMessageContent.length > 1000) {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: "bot",
        content:
          "Sorry, your message is too long. Please keep messages within 1000 characters.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Rate limiting check (prevent spamming)
    const currentTime = Date.now();
    if (currentTime - lastMessageTime < 1000) {
      const rateLimitMessage: ChatMessage = {
        id: `rate-limit-${Date.now()}`,
        type: "bot",
        content:
          "Please wait a moment before sending another message to avoid sending too frequently.",
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, rateLimitMessage]);
      return;
    }
    setLastMessageTime(currentTime);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: "user",
        content: userMessageContent,
        timestamp: new Date(),
      };

      setChatMessages((prev) => [...prev, userMessage]);
      setIsThinking(true);

      // Use typewriter effect to generate fixed reply
      await generateTypewriterResponse();
    } catch (err) {
      console.error("Failed to send message:", err);
      handleMessageError(err);
    } finally {
      setIsThinking(false);
    }
  };

  /**
   * Generate typewriter effect fixed reply
   */
  const generateTypewriterResponse = async (): Promise<void> => {
    console.log("Starting typewriter effect reply generation");

    // Wait for a short time to simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const fixedResponse = `As a TikTok revenue distribution expert, based on the provided data, I recommend creators adopt a **65%** revenue split ratio. Here's the detailed analysis:

**Core Basis:**
1. **Content Quality & Engagement Match**: Overall score of 0.69 and engagement rate of 0.12 show content has appeal but room for improvement. The 65% ratio acknowledges current performance while incentivizing creators to optimize engagement strategies.

2. **Fan Base & Stream Duration**: 50k followers and 120-minute stream duration indicate the creator has reached a certain scale, but stability score of 0.37 and retention rate of 0.58 suggest content consistency needs strengthening. The 65% ratio ensures revenue while encouraging content stability improvement.

3. **Growth Potential**: Peak audience of 14,574 and average audience of 12,515 show stream appeal, but comment count of 23,523 and like count of 29,275 indicate interaction depth could be explored further. The 65% ratio balances current revenue with future growth space.

**Why Choose 65%:**
- **Incentive Optimization**: Higher than platform default ratio (usually 50-70%), encouraging creators to improve engagement and retention rates.
- **Risk Control**: Avoids excessive ratios that could impact creator motivation due to revenue volatility.
- **Growth-Oriented**: Provides higher returns on current foundation, promoting dual enhancement of content quality and fan loyalty.

This ratio recognizes the creator's current performance while reserving space for future growth, making it a reasonable choice that balances short-term revenue with long-term development. Creators are advised to focus on improving retention rates and interaction depth to further increase revenue ratios.

(Note: Actual revenue ratios may be affected by TikTok platform policies, advertising split rules, and creator levels. Please refer to the platform's latest rules.)`;

    const typewriterMessage: ChatMessage = {
      id: `typewriter-bot-${Date.now()}`,
      type: "typewriter-bot",
      content: fixedResponse,
      timestamp: new Date(),
      metadata: {
        confidence: 0.92,
        sources: [
          "TikTok Data Analysis",
          "Revenue Distribution Algorithm",
          "Creator Performance Assessment",
        ],
      },
    };

    setChatMessages((prev) => [...prev, typewriterMessage]);
    console.log("Typewriter effect reply creation completed");
  };

  /**
   * Demo hardcoded streaming reply (for quick effect viewing)
   */
  const generateDemoStreamingResponse = async (): Promise<void> => {
    console.log("Starting demo streaming rendering effect");

    // 使用第一个直播记录的数据
    const firstRecord = livestreamRecords[0];
    const firstDistribution = firstRecord
      ? revenueDistributions.get(firstRecord.id)
      : null;

    // 创建流式机器人消息
    const streamingMessageId = `demo-streaming-${Date.now()}`;
    const streamingMessage: ChatMessage = {
      id: streamingMessageId,
      type: "streaming-bot",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
      segments: [],
      currentSegmentIndex: -1,
      metadata: {
        streamStartTime: new Date(),
        sources: ["直播记录数据", "收益分配规则"],
      },
    };

    // 立即添加流式消息到聊天列表
    setChatMessages((prev) => [...prev, streamingMessage]);

    // 定义演示用的段落数据
    const demoSegments: MessageSegment[] = [
      {
        id: `demo-segment-1-${Date.now()}`,
        type: "text",
        content: "正在分析您的问题...",
        completed: false,
      },
      {
        id: `demo-segment-2-${Date.now()}`,
        type: "tool",
        content: "正在查询相关数据...",
        completed: false,
        toolCall: {
          id: `demo-tool-1-${Date.now()}`,
          name: "queryLivestreamData",
          description: "查询相关直播记录和收益数据",
          params: {
            query: "科技前沿直播收益分配",
            recordId: firstRecord?.id,
          },
          status: "pending",
          timestamp: new Date(),
        },
      },
      {
        id: `demo-segment-3-${Date.now()}`,
        type: "analysis",
        content: "正在分析数据并组织回答...",
        completed: false,
      },
      {
        id: `demo-segment-4-${Date.now()}`,
        type: "tool",
        content: "正在生成回答...",
        completed: false,
        toolCall: {
          id: `demo-tool-2-${Date.now()}`,
          name: "generateAnswer",
          description: "基于分析结果生成专业回答",
          params: {
            analysisData: "收益分配分析完成",
            recordData: firstRecord,
          },
          status: "pending",
          timestamp: new Date(),
        },
      },
      {
        id: `demo-segment-5-${Date.now()}`,
        type: "result",
        content: "",
        completed: false,
      },
    ];

    // 模拟流式更新过程
    for (let i = 0; i < demoSegments.length; i++) {
      const segment = demoSegments[i];

      // 添加新段落
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === streamingMessageId) {
            const updatedSegments = [...(msg.segments || []), segment];
            return {
              ...msg,
              segments: updatedSegments,
              currentSegmentIndex: i,
              metadata: {
                ...msg.metadata,
                totalSegments: demoSegments.length,
              },
            };
          }
          return msg;
        });
      });

      // 等待一段时间
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 更新段落内容和状态
      if (segment.type === "text") {
        if (i === 0) {
          segment.content = `我理解您想了解"${firstRecord?.title || "科技前沿：AI与未来生活"}"这场直播的收益分配情况。让我查询相关数据来为您详细解答。`;
        } else {
          segment.content = `基于查询到的直播记录，我正在分析：\n\n• "${firstRecord?.title || "科技前沿：AI与未来生活"}"的收益分配规则\n• 总收益 ¥${firstRecord?.totalRevenue?.toLocaleString() || "89,420.75"} 的分配明细\n• 各参与方的分配比例和计算依据\n\n正在综合这些信息为您准备详细的回答...`;
        }
        segment.completed = true;
      } else if (segment.type === "tool") {
        // 更新工具调用状态
        if (segment.toolCall) {
          segment.toolCall.status = "running";
          segment.content =
            i === 1
              ? "检索直播记录和收益分配数据..."
              : "调用AI模型生成专业回答...";
        }

        // 再等待一段时间
        await new Promise((resolve) => setTimeout(resolve, 1500));

        if (segment.toolCall) {
          segment.toolCall.status = "completed";
          if (i === 1) {
            segment.toolCall.result = {
              recordFound: true,
              recordData: firstRecord,
              distributionData: firstDistribution,
            };
            segment.content = `已找到直播记录"${firstRecord?.title || "科技前沿：AI与未来生活"}"`;
          } else {
            segment.toolCall.result = { answer: "AI回答生成完成" };
            segment.content = "AI回答生成完成";
          }
        }
        segment.completed = true;
      } else if (segment.type === "analysis") {
        // 等待分析时间
        await new Promise((resolve) => setTimeout(resolve, 2000));
        segment.completed = true;
      } else if (segment.type === "result") {
        // 生成最终回答
        segment.content = `关于"${firstRecord?.title || "科技前沿：AI与未来生活"}"直播的收益分配分析：

📊 **直播基本信息**
• 直播时长：${firstRecord?.duration || "2h 45m"}
• 观看人数：${firstRecord?.viewerCount?.toLocaleString() || "6,780"} 人
• 峰值观众：${firstRecord?.peakViewers?.toLocaleString() || "9,240"} 人
• 总收益：¥${firstRecord?.totalRevenue?.toLocaleString() || "89,420.75"}

💰 **收益分配明细**
${
  firstDistribution
    ? firstDistribution.distributions
        .map(
          (dist) =>
            `• ${dist.party}：¥${dist.amount.toLocaleString()} (${dist.percentage}%) - ${dist.reason}`
        )
        .join("\n")
    : "• 主播：¥53,652.45 (60%) - 基础分成比例\n• 平台：¥26,826.23 (30%) - 平台服务费\n• 合作方：¥8,942.07 (10%) - 技术支持费"
}

📋 **分配依据**
${firstDistribution?.calculationBasis || "基于平台标准收益分配政策，结合主播等级和合作协议条款进行计算"}

这次直播的收益分配符合平台政策，各方分配比例合理，体现了多方共赢的合作模式。`;
        segment.completed = true;
      }

      // 更新段落状态
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === streamingMessageId) {
            const updatedSegments = [...(msg.segments || [])];
            updatedSegments[i] = segment;
            return {
              ...msg,
              segments: updatedSegments,
            };
          }
          return msg;
        });
      });
    }

    // 流式完成后更新最终状态
    setChatMessages((prev) => {
      return prev.map((msg) => {
        if (msg.id === streamingMessageId) {
          const finalContent =
            demoSegments
              .filter((s) => s.type === "result")
              .map((s) => s.content)
              .join("\n") || "演示回答生成完成";

          return {
            ...msg,
            content: finalContent,
            isStreaming: false,
            segments: demoSegments,
            currentSegmentIndex: demoSegments.length - 1,
            metadata: {
              ...msg.metadata,
              streamEndTime: new Date(),
              totalSegments: demoSegments.length,
              confidence: 0.9,
            },
          };
        }
        return msg;
      });
    });

    console.log("演示流式渲染完成");
  };

  /**
   * 生成流式AI回复
   * 实现分步骤的思考过程展示
   */
  const generateStreamingAIResponse = async (
    userInput: string
  ): Promise<void> => {
    try {
      console.log("开始流式生成AI回复:", userInput);

      // 创建流式机器人消息
      const streamingMessageId = `streaming-bot-${Date.now()}`;
      const streamingMessage: ChatMessage = {
        id: streamingMessageId,
        type: "streaming-bot",
        content: "", // 初始内容为空
        timestamp: new Date(),
        isStreaming: true,
        segments: [],
        currentSegmentIndex: -1,
        metadata: {
          streamStartTime: new Date(),
          sources: ["直播记录数据", "收益分配规则"],
        },
      };

      // 立即添加流式消息到聊天列表
      setChatMessages((prev) => [...prev, streamingMessage]);

      // 检查是否询问特定直播的收益分配
      const recordMatch = findRelatedRecord(userInput);
      const distribution = recordMatch
        ? revenueDistributions.get(recordMatch.id)
        : null;

      // 构建增强的上下文，包含最近的对话历史
      const recentMessages = chatMessages.slice(-6); // 最近3轮对话
      const conversationContext = recentMessages
        .filter((msg) => msg.type !== "streaming-bot") // 排除流式消息避免干扰
        .map(
          (msg) => `${msg.type === "user" ? "用户" : "助手"}: ${msg.content}`
        )
        .join("\n");

      const enhancedInput = conversationContext
        ? `对话历史:\n${conversationContext}\n\n当前问题: ${userInput}`
        : userInput;

      // 使用流式AI服务生成分段回复
      const segments = await chatbotAIService.answerQuestionStreaming(
        enhancedInput,
        livestreamRecords,
        (updatedSegment: MessageSegment) => {
          // 每次段落更新时更新消息状态
          setChatMessages((prev) => {
            return prev.map((msg) => {
              if (msg.id === streamingMessageId) {
                // 找到并更新对应的段落
                const updatedSegments = [...(msg.segments || [])];
                const segmentIndex = updatedSegments.findIndex(
                  (s) => s.id === updatedSegment.id
                );

                if (segmentIndex >= 0) {
                  updatedSegments[segmentIndex] = updatedSegment;
                } else {
                  updatedSegments.push(updatedSegment);
                }

                // 计算当前显示的段落索引
                const currentIndex = updatedSegments.length - 1;

                return {
                  ...msg,
                  segments: updatedSegments,
                  currentSegmentIndex: currentIndex,
                  metadata: {
                    ...msg.metadata,
                    totalSegments: updatedSegments.length,
                  },
                };
              }
              return msg;
            });
          });
        }
      );

      // 流式完成后更新最终状态
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.id === streamingMessageId) {
            // 提取最终的回答内容
            const finalContent =
              segments
                .filter((s) => s.type === "result")
                .map((s) => s.content)
                .join("\n") || "回答生成完成";

            return {
              ...msg,
              content: finalContent,
              isStreaming: false,
              segments,
              currentSegmentIndex: segments.length - 1,
              metadata: {
                ...msg.metadata,
                streamEndTime: new Date(),
                totalSegments: segments.length,
                confidence: 0.8,
              },
            };
          }
          return msg;
        });
      });

      console.log("流式AI回复生成完成");
    } catch (error) {
      console.error("流式AI服务调用失败:", error);

      // 错误处理：更新消息为错误状态
      setChatMessages((prev) => {
        return prev.map((msg) => {
          if (msg.type === "streaming-bot" && msg.isStreaming) {
            return {
              ...msg,
              content: "抱歉，生成回答时遇到了问题。请稍后重试。",
              isStreaming: false,
              segments: [
                {
                  id: `error-${Date.now()}`,
                  type: "result" as const,
                  content: "抱歉，生成回答时遇到了问题。请稍后重试。",
                  completed: true,
                },
              ],
              currentSegmentIndex: 0,
              metadata: {
                ...msg.metadata,
                streamEndTime: new Date(),
              },
            };
          }
          return msg;
        });
      });

      throw error;
    }
  };

  /**
   * 生成AI回复（保留作为备用方案）
   * 集成真实的AI服务调用
   */
  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      // 检查是否询问特定直播的收益分配
      const recordMatch = findRelatedRecord(userInput);

      if (recordMatch) {
        const distribution = revenueDistributions.get(recordMatch.id);
        if (distribution) {
          // 如果询问特定直播的收益，使用专门的解释方法
          return await chatbotAIService.explainRevenue(
            recordMatch.id,
            distribution
          );
        }
      }

      // 构建增强的上下文，包含最近的对话历史
      const recentMessages = chatMessages.slice(-6); // 最近3轮对话
      const conversationContext = recentMessages
        .map(
          (msg) => `${msg.type === "user" ? "用户" : "助手"}: ${msg.content}`
        )
        .join("\n");

      // 使用通用问答方法，传入直播记录和对话历史作为上下文
      const enhancedInput = conversationContext
        ? `对话历史:\n${conversationContext}\n\n当前问题: ${userInput}`
        : userInput;

      return await chatbotAIService.answerQuestion(
        enhancedInput,
        livestreamRecords
      );
    } catch (error) {
      console.error("AI服务调用失败:", error);
      throw error;
    }
  };

  /**
   * 查找用户输入中提到的相关直播记录
   */
  const findRelatedRecord = (userInput: string): LivestreamRecord | null => {
    const input = userInput.toLowerCase();

    // 检查是否提到具体的直播标题关键词
    for (const record of livestreamRecords) {
      const titleKeywords = record.title.toLowerCase().split(/\s+/);
      if (titleKeywords.some((keyword) => input.includes(keyword))) {
        return record;
      }
    }

    // 检查是否提到日期相关信息
    if (
      input.includes("最近") ||
      input.includes("最新") ||
      input.includes("上次")
    ) {
      return livestreamRecords[0]; // 返回最新的记录
    }

    if (input.includes("年终") || input.includes("总结")) {
      return (
        livestreamRecords.find((r) => r.title.includes("年终总结")) || null
      );
    }

    if (input.includes("新年") || input.includes("展望")) {
      return (
        livestreamRecords.find((r) => r.title.includes("新年展望")) || null
      );
    }

    if (input.includes("产品") || input.includes("发布")) {
      return (
        livestreamRecords.find((r) => r.title.includes("产品发布")) || null
      );
    }

    return null;
  };

  /**
   * Handle message sending errors
   */
  const handleMessageError = (error: any) => {
    let errorMessage: string;
    let showRetry = false;

    // Provide different handling based on error type
    if (error.name === "NetworkError" || error.message?.includes("fetch")) {
      errorMessage =
        "Network connection issue detected. Please check your connection and try again.";
      showRetry = true;
    } else if (error.message?.includes("API")) {
      errorMessage =
        "AI service is temporarily unavailable. Please try again later.";
      showRetry = true;
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Request timeout. Please try again later.";
      showRetry = true;
    } else {
      errorMessage =
        "Sorry, an error occurred while processing your question. Please try again.";
    }

    // If it's a network error, provide some suggestions
    if (
      showRetry &&
      (error.name === "NetworkError" || error.message?.includes("fetch"))
    ) {
      errorMessage +=
        "\n\nSuggestions:\n• Check your network connection\n• Refresh the page and try again\n• Contact technical support if the problem persists";
    }

    const errorBotMessage: ChatMessage = {
      id: `error-${Date.now()}`,
      type: "bot",
      content: errorMessage,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, errorBotMessage]);
  };

  /**
   * Handle error retry
   */
  const handleRetry = () => {
    initializeData();
  };

  /**
   * Clear chat history
   * Provide functionality for users to clear conversation records
   */
  const clearChatHistory = () => {
    try {
      setChatMessages([]);
      setDefaultWelcomeMessage(livestreamRecords);
      console.log("Chat history cleared");
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  // === Render Functions ===

  if (isLoading) {
    return (
      <view className="chatbot-page">
        <view className="chatbot-header">
          <text className="chatbot-title">FairTik</text>
          <view className="reports-button" bindtap={onNavigateToReports}>
            <Icon name="dashboard" size={24} className="reports-button-icon" />
          </view>
        </view>
        <view className="chatbot-content">
          <view className="loading-container">
            <Icon name="thinking" size={24} className="loading-icon" />
            <text className="loading-text">Loading...</text>
          </view>
        </view>
      </view>
    );
  }

  if (error) {
    return (
      <view className="chatbot-page">
        <view className="chatbot-header">
          <text className="chatbot-title">FairTik</text>
          <view className="reports-button" bindtap={onNavigateToReports}>
            <Icon name="dashboard" size={24} className="reports-button-icon" />
          </view>
        </view>
        <view className="chatbot-content">
          <view className="error-container">
            <Icon name="error" size={48} className="error-icon" />
            <text className="error-message">{error.message}</text>
            {error.retryable && (
              <view className="retry-button" bindtap={handleRetry}>
                <text>Retry</text>
              </view>
            )}
          </view>
        </view>
      </view>
    );
  }

  return (
    <view className="chatbot-page">
      {/* 顶部导航栏 */}
      <view className="chatbot-header">
        <text className="chatbot-title">FairTik</text>
        <view className="header-buttons">
          {/* 演示按钮 */}
          {/* <view className="demo-button" bindtap={generateDemoStreamingResponse}>
            <text className="demo-button-text">🎬 演示流式回答</text>
          </view> */}
          <view className="reports-button" bindtap={onNavigateToReports}>
            <Icon name="dashboard" size={24} className="reports-button-icon" />
          </view>
        </view>
      </view>

      {/* 主内容区域 */}
      <view className="chatbot-content">
        {/* 直播记录展示区域 */}
        {/* <LivestreamRecords
          records={livestreamRecords}
          expandedRecordId={expandedRecordId}
          revenueDistributions={revenueDistributions}
          onRecordClick={handleRecordClick}
          onRecordCollapse={handleRecordCollapse}
        />
 */}
        {/* 聊天界面区域 */}
        <view className="chat-section">
          <ChatInterface
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
            onRecordSelect={handleRecordSelect}
          />
        </view>
      </view>
    </view>
  );
}
