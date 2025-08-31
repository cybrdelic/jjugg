import AppLayout from '@/components/AppLayout';
import dynamic from 'next/dynamic';

const FlowCanvas = dynamic(() => import('@/components/email/IngestFlowCanvas'), { ssr: false });

export default function EmailFlowPage() {
  return (
    <AppLayout currentSection="applications-section">
      <div className="flow-full"> {/* expand to full height inside layout padding */}
        <FlowCanvas />
      </div>
      <style jsx>{`
        .flow-full { height:100vh; margin:-32px; }
      `}</style>
    </AppLayout>
  );
}
