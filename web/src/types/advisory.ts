export interface AIAdvisoryResponse {
  crop: string;
  possible_issue: string;
  confidence: 'High' | 'Medium' | 'Low';
  severity: 'High' | 'Medium' | 'Low';
  observations: string[];
  recommended_actions: string[];
  prevention: string[];
  weather_considerations: string[];
  limitations: string[];
}
