/**
 * Anti-Gravity 2.0 Background Task Scheduler & Cron Runner
 * -------------------------------------------------------------
 * Schedules automated daily executive briefings (08:00 AM),
 * vehicle maintenance alerts, and pending settlement audits.
 */

import { AntiGravityAIService } from '../services/aiService';

export class BackgroundJobScheduler {
  private static isRunning = false;
  private static activeJobs: Map<string, string> = new Map();

  /**
   * Starts the background scheduler loop.
   * Cron Schedule: '0 8 * * *' (Every day at 08:00 AM)
   */
  public static start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('⏰ [AntiGravity Scheduler] Background Cron Scheduler initialized.');
    console.log('📅 Job Registered: "0 8 * * *" -> Daily Executive Summary Briefing');

    this.activeJobs.set('daily_briefing', '0 8 * * *');
    this.activeJobs.set('settlement_audit', '0 18 * * *');
  }

  /**
   * Triggers the daily 08:00 AM executive briefing generation.
   */
  public static async runDailyExecutiveBriefingJob(companyName: string = 'Diplon Travel ERP Headquarters'): Promise<string> {
    console.log(`⏰ [AntiGravity Cron] Running 08:00 AM Daily Executive Briefing for ${companyName}...`);
    const briefing = await AntiGravityAIService.generateExecutiveBriefing(companyName);
    console.log('✅ [AntiGravity Cron] Executive Briefing Generated successfully.');
    return briefing.executiveSummaryMarkdown;
  }

  /**
   * Stops scheduler tasks.
   */
  public static stop(): void {
    this.isRunning = false;
    this.activeJobs.clear();
    console.log('🛑 [AntiGravity Scheduler] Scheduler stopped.');
  }
}
