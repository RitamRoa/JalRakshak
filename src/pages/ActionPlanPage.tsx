import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Info, Droplet, AlertCircle, LifeBuoy, Gift } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useChatContext } from '../components/Layout';

interface WaterTip {
  id: number;
  title: string;
  description: string;
  tags: string[];
}

interface WaterTips {
  emergency: WaterTip[];
  conservation: WaterTip[];
  quality: WaterTip[];
}

interface Badge {
  name: string;
  icon: React.ReactNode;
}

interface PersonalActionPlan {
  waterScore: number;
  recommendations: string[];
  badgesEarned: Badge[];
  upcomingBadges: Badge[];
}

const ActionPlanPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<keyof WaterTips>('emergency');
  const { openChatWithQuery } = useChatContext();
  
  const handleChatQuery = (query: string) => {
    openChatWithQuery(query);
  };
  
  // Mock data for water safety tips
  const waterTips: WaterTips = {
    emergency: [
      { 
        id: 1, 
        title: i18n.language === 'kn' ? 'ಪ್ರವಾಹ ತುರ್ತು ಸಲಹೆಗಳು' : t('actionPlan.emergencyTips.flooding.title'),
        description: i18n.language === 'kn' ? 'ಪ್ರವಾಹ ಸಂಭವಿಸಿದಾಗ ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ. ನೀರಿನ ಮಟ್ಟವನ್ನು ಗಮನಿಸಿ ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳನ್ನು ಕೈಯಲ್ಲಿ ಇಟ್ಟುಕೊಳ್ಳಿ.' : t('actionPlan.emergencyTips.flooding.description'),
        tags: i18n.language === 'kn' ? ['ಪ್ರವಾಹ', 'ತುರ್ತು', 'ಸುರಕ್ಷತೆ'] : [t('tags.flood'), t('tags.emergency'), t('tags.safety')]
      },
      { 
        id: 2, 
        title: i18n.language === 'kn' ? 'ನೀರಿನ ಮಾಲಿನ್ಯ ಎಚ್ಚರಿಕೆ' : t('actionPlan.emergencyTips.contamination.title'),
        description: i18n.language === 'kn' ? 'ನೀರು ಮಾಲಿನ್ಯಗೊಂಡಿದೆ ಎಂದು ಶಂಕಿಸಿದರೆ, ಕುಡಿಯಲು ಅಥವಾ ಅಡುಗೆಗೆ ಬಳಸಬೇಡಿ. ತಕ್ಷಣ ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳಿಗೆ ವರದಿ ಮಾಡಿ.' : t('actionPlan.emergencyTips.contamination.description'),
        tags: i18n.language === 'kn' ? ['ಮಾಲಿನ್ಯ', 'ಆರೋಗ್ಯ', 'ಸುರಕ್ಷತೆ'] : [t('tags.contamination'), t('tags.health'), t('tags.safety')]
      },
      { 
        id: 3, 
        title: i18n.language === 'kn' ? 'ನೀರಿನ ಸೋರಿಕೆ ತುರ್ತು' : t('actionPlan.emergencyTips.leak.title'),
        description: i18n.language === 'kn' ? 'ದೊಡ್ಡ ನೀರಿನ ಸೋರಿಕೆ ಕಂಡುಬಂದರೆ, ತಕ್ಷಣ ಮುಖ್ಯ ನೀರಿನ ವಾಲ್ವ್ ಮುಚ್ಚಿ ಮತ್ತು ಪ್ಲಂಬರ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ.' : t('actionPlan.emergencyTips.leak.description'),
        tags: i18n.language === 'kn' ? ['ಸೋರಿಕೆ', 'ತುರ್ತು', 'ಪೈಪ್'] : [t('tags.leak'), t('tags.emergency'), t('tags.pipe')]
      },
    ],
    conservation: [
      { 
        id: 4, 
        title: i18n.language === 'kn' ? 'ದೈನಂದಿನ ನೀರಿನ ಸಂರಕ್ಷಣೆ ಸಲಹೆಗಳು' : t('actionPlan.conservationTips.daily.title'),
        description: i18n.language === 'kn' ? 'ಸೋರುವ ನಲ್ಲಿಗಳನ್ನು ಸರಿಪಡಿಸಿ, ಕಡಿಮೆ ಸಮಯದ ಸ್ನಾನ ಮಾಡಿ, ಮತ್ತು ಹಲ್ಲು ಬುರುಶ್ ಮಾಡುವಾಗ ನಲ್ಲಿಗಳನ್ನು ಮುಚ್ಚಿ. ನೀರು-ದಕ್ಷ ಉಪಕರಣಗಳನ್ನು ಬಳಸಿ.' : t('actionPlan.conservationTips.daily.description'),
        tags: i18n.language === 'kn' ? ['ಸಂರಕ್ಷಣೆ', 'ಮನೆ', 'ದೈನಂದಿನ'] : [t('tags.conservation'), t('tags.household'), t('tags.daily')]
      },
      { 
        id: 5, 
        title: i18n.language === 'kn' ? 'ಮಳೆ ನೀರು ಕೊಯ್ಲು ಮೂಲಭೂತ ವಿಷಯಗಳು' : t('actionPlan.conservationTips.rainwater.title'),
        description: i18n.language === 'kn' ? 'ಮಾಳಿಗೆಯಿಂದ ಮಳೆನೀರು ಸಂಗ್ರಹಿಸಲು ಮಳೆ ಬ್ಯಾರೆಲ್‌ಗಳನ್ನು ಅಳವಡಿಸಿ. ಈ ನೀರನ್ನು ತೋಟಗಳಿಗೆ ಮತ್ತು ಕುಡಿಯಲು ಅಲ್ಲದ ಉದ್ದೇಶಗಳಿಗೆ ಬಳಸಿ.' : t('actionPlan.conservationTips.rainwater.description'),
        tags: i18n.language === 'kn' ? ['ಸಂರಕ್ಷಣೆ', 'ಮಳೆನೀರು', 'ಸುಸ್ಥಿರ'] : [t('tags.conservation'), t('tags.rainwater'), t('tags.sustainable')]
      },
      { 
        id: 6, 
        title: i18n.language === 'kn' ? 'ತೋಟದಲ್ಲಿ ನೀರಿನ ಬಳಕೆ ಕಡಿಮೆ ಮಾಡುವುದು' : t('actionPlan.conservationTips.garden.title'),
        description: i18n.language === 'kn' ? 'ಬೆಳಗ್ಗೆ ಬೇಗ ಅಥವಾ ಸಂಜೆ ಸಸ್ಯಗಳಿಗೆ ನೀರು ಹಾಕಿ. ಹನಿ ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಮಲ್ಚ್ ಬಳಸಿ ಆವಿಯಾಗುವಿಕೆ ಕಡಿಮೆ ಮಾಡಿ.' : t('actionPlan.conservationTips.garden.description'),
        tags: i18n.language === 'kn' ? ['ಸಂರಕ್ಷಣೆ', 'ತೋಟ', 'ಹೊರಾಂಗಣ'] : [t('tags.conservation'), t('tags.garden'), t('tags.outdoor')]
      },
    ],
    quality: [
      { 
        id: 7, 
        title: i18n.language === 'kn' ? 'ನೀರಿನ ಗುಣಮಟ್ಟ ವರದಿಗಳು' : t('actionPlan.qualityTips.reports.title'),
        description: i18n.language === 'kn' ? 'ನಿಯಮಿತವಾಗಿ ನೀರಿನ ಗುಣಮಟ್ಟ ವರದಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ. ಯಾವುದೇ ಕಳವಳಗಳಿದ್ದರೆ ಸ್ಥಳೀಯ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ.' : t('actionPlan.qualityTips.reports.description'),
        tags: i18n.language === 'kn' ? ['ಗುಣಮಟ್ಟ', 'ಶಿಕ್ಷಣ', 'ಆರೋಗ್ಯ'] : [t('tags.quality'), t('tags.education'), t('tags.health')]
      },
      { 
        id: 8, 
        title: i18n.language === 'kn' ? 'ನೀರಿನ ಮಾಲಿನ್ಯ ಪರೀಕ್ಷೆ' : t('actionPlan.qualityTips.contamination.title'),
        description: i18n.language === 'kn' ? 'ನಿಮ್ಮ ನೀರಿನ ಬಣ್ಣ, ರುಚಿ ಅಥವಾ ವಾಸನೆಯಲ್ಲಿ ಬದಲಾವಣೆ ಕಂಡುಬಂದರೆ, ತಕ್ಷಣ ಪರೀಕ್ಷೆಗಾಗಿ ವರದಿ ಮಾಡಿ.' : t('actionPlan.qualityTips.contamination.description'),
        tags: i18n.language === 'kn' ? ['ಗುಣಮಟ್ಟ', 'ಮಾಲಿನ್ಯ', 'ಆರೋಗ್ಯ'] : [t('tags.quality'), t('tags.contamination'), t('tags.health')]
      },
      { 
        id: 9, 
        title: i18n.language === 'kn' ? 'ಮನೆಯಲ್ಲಿ ನೀರಿನ ಪರೀಕ್ಷೆ' : t('actionPlan.qualityTips.testing.title'),
        description: i18n.language === 'kn' ? 'ನಿಯಮಿತವಾಗಿ ಮನೆಯ ನೀರಿನ ಪರೀಕ್ಷಾ ಕಿಟ್‌ಗಳನ್ನು ಬಳಸಿ. ಅನುಮಾನಾಸ್ಪದ ಫಲಿತಾಂಶಗಳಿಗೆ ವೃತ್ತಿಪರ ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ.' : t('actionPlan.qualityTips.testing.description'),
        tags: i18n.language === 'kn' ? ['ಗುಣಮಟ್ಟ', 'ಪರೀಕ್ಷೆ', 'ಮನೆ'] : [t('tags.quality'), t('tags.testing'), t('tags.home')]
      },
    ],
  };
  
  // Filter tips based on search query
  const filteredTips = searchQuery
    ? Object.values(waterTips).flat().filter((tip: WaterTip) => 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : waterTips[activeTab];
  
  // Mock personal action plan AI-generated content
  const personalActionPlan: PersonalActionPlan = {
    waterScore: 87,
    recommendations: [
      t('actionPlan.recommendations.leak'),
      t('actionPlan.recommendations.fixtures'),
      t('actionPlan.recommendations.rainwater'),
      t('actionPlan.recommendations.contamination')
    ],
    badgesEarned: [
      { name: t('actionPlan.achievements.badges.leakDetective'), icon: <Droplet size={16} /> },
      { name: t('actionPlan.achievements.badges.communityGuardian'), icon: <LifeBuoy size={16} /> }
    ],
    upcomingBadges: [
      { name: t('actionPlan.achievements.badges.waterSaver'), icon: <Droplet size={16} /> },
      { name: t('actionPlan.achievements.badges.floodFighter'), icon: <AlertCircle size={16} /> }
    ]
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-gray-900">{t('actionPlan.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('actionPlan.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Personal Score & Action Plan */}
          <div className="space-y-8">
            {/* Water Safety Score */}
            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div className="text-center py-6">
                <h2 className="text-xl font-semibold mb-3">{t('actionPlan.waterSafetyScore')}</h2>
                <div className="inline-flex items-center justify-center rounded-full bg-white h-32 w-32 mb-4">
                  <span className="text-4xl font-bold text-primary-600">{personalActionPlan.waterScore}</span>
                </div>
                <p className="text-primary-100 mb-1">{t('actionPlan.yourNeighborhood')}</p>
                <p className="text-xl font-semibold mb-4">{t('actionPlan.goodManagement')}</p>
                
                <div className="w-full bg-primary-700 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-white h-2.5 rounded-full" 
                    style={{ width: `${personalActionPlan.waterScore}%` }}
                  ></div>
                </div>
                
                <p className="text-sm opacity-90">{t('actionPlan.improveScore')}</p>
              </div>
            </Card>
            
            {/* Personalized Recommendations */}
            <Card 
              title={t('actionPlan.yourActionPlan')}
              subtitle={t('actionPlan.aiRecommendations')}
              className="bg-white"
            >
              <div className="space-y-4">
                {personalActionPlan.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="ml-3 text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </Card>
            
            {/* Badges & Gamification */}
            <Card
              title={t('actionPlan.achievements.title')}
              subtitle={t('actionPlan.achievements.subtitle')}
              className="bg-white"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                    <Gift size={16} className="mr-2 text-primary-600" />
                    {t('actionPlan.achievements.badgesEarned')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {personalActionPlan.badgesEarned.map((badge, index) => (
                      <div 
                        key={index}
                        className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-2">
                          {badge.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-3">{t('actionPlan.achievements.badgesToEarn')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {personalActionPlan.upcomingBadges.map((badge, index) => (
                      <div 
                        key={index}
                        className="flex flex-col items-center p-3 bg-gray-50 rounded-lg border border-gray-100 opacity-60"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mb-2">
                          {badge.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-500">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right column: Tips & Knowledge Base */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search Box */}
            <div className="mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={i18n.language === 'kn' ? 'ನೀರಿನ ಸುರಕ್ಷತೆ ಸಲಹೆಗಳನ್ನು ಹುಡುಕಿ...' : t('actionPlan.searchPlaceholder')}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Tip Categories */}
            {!searchQuery && (
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('emergency')}
                  className={`flex-1 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'emergency'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {i18n.language === 'kn' ? 'ತುರ್ತು' : t('actionPlan.tipCategories.emergency')}
                </button>
                <button
                  onClick={() => setActiveTab('conservation')}
                  className={`flex-1 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'conservation'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {i18n.language === 'kn' ? 'ಸಂರಕ್ಷಣೆ' : t('actionPlan.tipCategories.conservation')}
                </button>
                <button
                  onClick={() => setActiveTab('quality')}
                  className={`flex-1 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'quality'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {i18n.language === 'kn' ? 'ಗುಣಮಟ್ಟ' : t('actionPlan.tipCategories.quality')}
                </button>
              </div>
            )}
            
            {/* Search Results or Category Tips */}
            <div className="space-y-6">
              {searchQuery && (
                <h3 className="text-lg font-medium text-gray-900">
                  {t('actionPlan.searchResults')} "{searchQuery}"
                </h3>
              )}
              
              {filteredTips.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Info className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">{t('actionPlan.noResults')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('actionPlan.tryDifferent')}
                  </p>
                </div>
              ) : (
                filteredTips.map((tip: WaterTip) => (
                  <Card key={tip.id} className="bg-white">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tip.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tip.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="primary" size="sm">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            
            {/* Language Toggle for Tips */}
            <div className="flex justify-center space-x-4 py-4">
              <Button
                variant={i18n.language === 'en' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={i18n.language === 'hi' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('hi')}
              >
                हिंदी
              </Button>
              <Button
                variant={i18n.language === 'kn' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('kn')}
              >
                ಕನ್ನಡ
              </Button>
            </div>
            
            {/* AI Chat Suggestions */}
            <Card 
              title={t('actionPlan.personalizedAdvice')}
              className="bg-primary-50 border border-primary-100"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  {i18n.language === 'kn' ? 'ಈ ವಿಷಯಗಳ ಬಗ್ಗೆ ನಮ್ಮ AI ಸಹಾಯಕರನ್ನು ಕೇಳಿ:' : t('actionPlan.aiSuggestions')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleChatQuery(i18n.language === 'kn' ? 'ನೀರಿನ ಸೋರಿಕೆಯನ್ನು ಸರಿಪಡಿಸುವುದು ಹೇಗೆ' : 'How to fix a leak')}>
                    {i18n.language === 'kn' ? 'ನೀರಿನ ಸೋರಿಕೆಯನ್ನು ಸರಿಪಡಿಸುವುದು ಹೇಗೆ' : t('actionPlan.suggestedQueries.leak')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleChatQuery(i18n.language === 'kn' ? 'ನೀರಿನ ಸಂರಕ್ಷಣೆ ಸಲಹೆಗಳು' : 'Water conservation tips')}>
                    {i18n.language === 'kn' ? 'ನೀರಿನ ಸಂರಕ್ಷಣೆ ಸಲಹೆಗಳು' : t('actionPlan.suggestedQueries.conservation')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleChatQuery(i18n.language === 'kn' ? 'ನೀರು ಕುದಿಸುವ ಸಲಹೆ' : 'Boil water advisory')}>
                    {i18n.language === 'kn' ? 'ನೀರು ಕುದಿಸುವ ಸಲಹೆ' : t('actionPlan.suggestedQueries.boilWater')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleChatQuery(i18n.language === 'kn' ? 'ಪ್ರವಾಹ ಸಿದ್ಧತೆ' : 'Flood preparation')}>
                    {i18n.language === 'kn' ? 'ಪ್ರವಾಹ ಸಿದ್ಧತೆ' : t('actionPlan.suggestedQueries.flood')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPlanPage;