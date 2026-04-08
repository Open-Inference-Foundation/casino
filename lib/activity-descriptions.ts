/**
 * Human-readable activity descriptions for SSE tool events (P0-18).
 *
 * Maps tool names to user-friendly status text. Unknown tools get the
 * default "Working..." — never expose raw tool names to the user.
 */

export const TOOL_ACTIVITY: Record<string, string> = {
  // Site build/edit
  build_site: 'Building your site...',
  build_static_site: 'Building your site...',
  edit_site: 'Editing your site...',
  provision_app_infrastructure: 'Setting up infrastructure...',
  save_site_file: 'Saving files...',
  publish_site: 'Publishing your site...',
  publish_build_to_cdn: 'Deploying to CDN...',
  detect_framework: 'Detecting framework...',
  build_javascript_project: 'Compiling project...',

  // Data operations
  query_dataset_sql: 'Running a SQL query...',
  query_mongodb: 'Querying the database...',
  aggregate_mongodb: 'Aggregating data...',
  mongodb_insert: 'Saving to database...',
  mongodb_update: 'Updating records...',
  describe_dataset: 'Inspecting your data...',
  list_datasets: 'Looking at your datasets...',
  retrieve_dataset: 'Loading dataset...',
  filter_dataset: 'Filtering data...',
  merge_datasets: 'Merging datasets...',

  // Analysis & visualization
  calculate_correlation: 'Calculating correlations...',
  analyze: 'Running analysis...',
  detect_anomalies: 'Looking for anomalies...',
  create_histogram: 'Creating a histogram...',
  create_scatter_plot: 'Creating a scatter plot...',
  create_bar_chart: 'Creating a bar chart...',
  create_line_plot: 'Creating a line chart...',
  create_heatmap: 'Creating a heatmap...',
  create_pie_chart: 'Making a pie chart...',
  create_box_plot: 'Creating a box plot...',

  // Code execution
  execute_python_code: 'Running code...',
  execute_python_code_bedrock: 'Running code...',
  execute_python_code_local: 'Running code...',
  execute_python_claude: 'Running code...',
  daytona_run_code: 'Running code...',
  daytona_run_shell: 'Running a command...',

  // Strands Tier 1 (P0-21)
  calculator: 'Crunching numbers...',
  current_time: 'Checking the clock...',
  http_request: 'Fetching data...',
  rss: 'Reading the feed...',
  diagram: 'Drawing a diagram...',

  // Workspace
  workspace_write_report: 'Writing a report...',
  workspace_write_script: 'Saving a script...',
  workspace_save_dataset: 'Saving data...',
  import_github_repo: 'Importing from GitHub...',

  // External services
  get_ga4_report: 'Pulling analytics...',
  search_youtube_videos: 'Searching YouTube...',
  fetch_digest_sources: 'Gathering your digest...',
  generate_daily_digest: 'Writing your daily brief...',

  // Internal routing (hidden from user in practice, but translated just in case)
  escalate_to_swarm: 'Working on it...',
  handoff_to_agent: 'Working on it...',
  get_agent_graph: 'Planning...',
};

export const DEFAULT_ACTIVITY = 'Working...';

export function getActivityDescription(toolName: string): string {
  return TOOL_ACTIVITY[toolName] ?? DEFAULT_ACTIVITY;
}
