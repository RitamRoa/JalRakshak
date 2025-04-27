import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Info, Droplet, AlertCircle, LifeBuoy, Gift } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const ActionPlanPage = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('emergency');
  
  // Mock data for water safety tips
  const waterTips = {
    emergency: [
      { 
        id: 1, 
        title: 'What to do during flooding',
        description: 'Turn off electricity, move valuable items to higher ground, and evacuate if necessary. Avoid walking through moving water.',
        tags: ['flood', 'emergency', 'safety']
      },
      { 
        id: 2, 
        title: 'Dealing with contaminated water',
        description: 'Boil water for at least one minute before drinking. Use bottled water for cooking. Report to local authorities immediately.',
        tags: ['contamination', 'health', 'safety']
      },
      { 
        id: 3, 
        title: 'Emergency pipe leak response',
        description: 'Turn off the main water valve immediately. Use towels to contain the spread and call a plumber as soon as possible.',
        tags: ['leak', 'emergency', 'pipe']
      },
    ],
    conservation: [
      { 
        id: 4, 
        title: 'Daily water conservation tips',
        description: 'Fix leaky faucets, take shorter showers, and turn off taps when brushing teeth. Use water-efficient appliances.',
        tags: ['conservation', 'household', 'daily']
      },
      { 
        id: 5, 
        title: 'Rainwater harvesting basics',
        description: 'Install rain barrels to collect rainwater from rooftops. Use this water for gardens and non-potable purposes.',
        tags: ['conservation', 'rainwater', 'sustainable']
      },
      { 
        id: 6, 
        title: 'Reducing water usage in gardens',
        description: 'Water plants during early morning or evening. Use drip irrigation systems and mulch to reduce evaporation.',
        tags: ['conservation', 'garden', 'outdoor']
      },
    ],
    quality: [
      { 
        id: 7, 
        title: 'Understanding water quality reports',
        description: 'Learn to read and understand the annual water quality reports provided by your local water supplier.',
        tags: ['quality', 'education', 'health']
      },
      { 
        id: 8, 
        title: 'Signs of water contamination',
        description: 'Watch for unusual odor, color, or taste in water. Cloudy appearance or floating particles may indicate contamination.',
        tags: ['quality', 'contamination', 'health']
      },
      { 
        id: 9, 
        title: 'Home water testing guide',
        description: 'Use home water testing kits to check for common contaminants. Professional testing is recommended for serious concerns.',
        tags: ['quality', 'testing', 'home']
      },
    ],
  };
  
  // Filter tips based on search query
  const filteredTips = searchQuery
    ? Object.values(waterTips).flat().filter(tip => 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        tip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : waterTips[activeTab];
  
  // Mock personal action plan AI-generated content
  const personalActionPlan = {
    waterScore: 87,
    recommendations: [
      "Fix the reported leak in your neighborhood within 48 hours",
      "Install water-efficient fixtures in your home",
      "Participate in the community rainwater harvesting initiative",
      "Report any signs of water contamination immediately"
    ],
    badgesEarned: [
      { name: "Leak Detective", icon: <Droplet size={16} /> },
      { name: "Community Guardian", icon: <LifeBuoy size={16} /> }
    ],
    upcomingBadges: [
      { name: "Water Saver", icon: <Droplet size={16} /> },
      { name: "Flood Fighter", icon: <AlertCircle size={16} /> }
    ]
  };
  
  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-display font-bold text-gray-900">{t('actionPlan.title')}</h1>
          <p className="mt-2 text-lg text-gray-600">
            Personalized recommendations and water safety advice
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Personal Score & Action Plan */}
          <div className="space-y-8">
            {/* Water Safety Score */}
            <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
              <div className="text-center py-6">
                <h2 className="text-xl font-semibold mb-3">{t('actionPlan.safetyScore')}</h2>
                <div className="inline-flex items-center justify-center rounded-full bg-white h-32 w-32 mb-4">
                  <span className="text-4xl font-bold text-primary-600">{personalActionPlan.waterScore}</span>
                </div>
                <p className="text-primary-100 mb-1">Your neighborhood has</p>
                <p className="text-xl font-semibold mb-4">Good Water Management</p>
                
                <div className="w-full bg-primary-700 rounded-full h-2.5 mb-6">
                  <div 
                    className="bg-white h-2.5 rounded-full" 
                    style={{ width: `${personalActionPlan.waterScore}%` }}
                  ></div>
                </div>
                
                <p className="text-sm opacity-90">Score higher by completing recommended actions and reporting water issues</p>
              </div>
            </Card>
            
            {/* Personalized Recommendations */}
            <Card 
              title="Your Action Plan"
              subtitle="AI-generated recommendations based on your area's water issues"
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
              title="Your Achievements"
              subtitle="Badges earned for your contributions"
              className="bg-white"
            >
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-3 flex items-center">
                    <Gift size={16} className="mr-2 text-primary-600" />
                    Badges Earned
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
                  <h3 className="font-medium text-sm text-gray-700 mb-3">Badges to Earn</h3>
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
                  placeholder={t('actionPlan.searchPlaceholder')}
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
                  {t('actionPlan.tipCategories.emergency')}
                </button>
                <button
                  onClick={() => setActiveTab('conservation')}
                  className={`flex-1 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'conservation'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('actionPlan.tipCategories.conservation')}
                </button>
                <button
                  onClick={() => setActiveTab('quality')}
                  className={`flex-1 py-3 font-medium text-sm border-b-2 ${
                    activeTab === 'quality'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t('actionPlan.tipCategories.quality')}
                </button>
              </div>
            )}
            
            {/* Search Results or Category Tips */}
            <div className="space-y-6">
              {searchQuery && (
                <h3 className="text-lg font-medium text-gray-900">
                  Search results for "{searchQuery}"
                </h3>
              )}
              
              {filteredTips.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                  <Info className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try different keywords or browse categories
                  </p>
                </div>
              ) : (
                filteredTips.map((tip) => (
                  <Card key={tip.id} className="bg-white">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{tip.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {tip.tags.map((tag, index) => (
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
                English
              </Button>
              <Button
                variant={i18n.language === 'hi' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('hi')}
              >
                हिंदी (Hindi)
              </Button>
            </div>
            
            {/* AI Chat Suggestions */}
            <Card 
              title="Need Personalized Advice?"
              className="bg-primary-50 border border-primary-100"
            >
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Try asking our AI assistant about these topics:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("how to fix a leak")}>
                    How to fix a leak
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("water conservation tips")}>
                    Water conservation tips
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("boil water advisory")}>
                    Boil water advisory
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("flood preparation")}>
                    Flood preparation
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