import './LoyaltyAdmin.css'
import {useState} from 'react'
import LoyaltyRules from './LoyaltyRules'
import LoyaltyRewards from './LoyaltyRewards'

type LoyaltyTabType = 'rules' | 'rewards'

function LoyaltyAdmin() {
    const [activeTab, setActiveTab] = useState<LoyaltyTabType>('rules')

    return (
        <div className="loyalty-admin-container">
            <div className="loyalty-admin-content">
                <div className="loyalty-admin-header">
                    <h1>Управление скидками</h1>
                </div>

                <div className="loyalty-admin-nav">
                    <div className="loyalty-nav-tabs">
                        <button
                            className={`loyalty-nav-tab ${activeTab === 'rules' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rules')}
                        >
                            Общие правила скидок
                        </button>

                        <button
                            className={`loyalty-nav-tab ${activeTab === 'rewards' ? 'active' : ''}`}
                            onClick={() => setActiveTab('rewards')}
                        >
                            Персональные скидки
                        </button>
                    </div>
                </div>

                <div className="loyalty-admin-content-area">
                    {activeTab === 'rules' ? (
                        <LoyaltyRules/>
                    ) : (
                        <LoyaltyRewards/>
                    )}
                </div>
            </div>
        </div>
    )
}

export default LoyaltyAdmin
