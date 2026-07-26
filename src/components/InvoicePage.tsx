import {useState} from 'react'
import './InvoicePage.css'
import LegalInvoice from './LegalInvoice'
import IndividualInvoice from './IndividualInvoice'
import {useAuthUser} from "../hooks/useAuthUser.ts";

type InvoiceType = 'legal' | 'individual'

function InvoicePage() {
    const [activeTab, setActiveTab] = useState<InvoiceType>('individual')
    const { user: user } = useAuthUser()

    return (
        <div className="invoice-page-container">
            <div className="invoice-page-content">
                <div className="invoice-page-header">
                    <h1>Пополнение лицевого счета</h1>
                </div>

                <div className="invoice-page-nav">
                    <div className="invoice-nav-tabs">
                        <button
                            disabled={user?.role === 'NON_RESIDENT'}
                            className={`invoice-nav-tab ${activeTab === 'legal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('legal')}
                        >
                            Юридическое лицо
                        </button>

                        <button
                            className={`invoice-nav-tab ${activeTab === 'individual' ? 'active' : ''}`}
                            onClick={() => setActiveTab('individual')}
                        >
                            Физическое лицо
                        </button>
                    </div>
                </div>

                <div className="invoice-page-content-area">
                    {activeTab === 'legal' ? (
                        <LegalInvoice/>
                    ) : (
                        <IndividualInvoice/>
                    )}
                </div>
            </div>
        </div>
    )
}

export default InvoicePage
