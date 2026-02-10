import { CompanyData } from '@/lib/utils';
import { 
  CustomMetricCard, 
  ViewsCard, 
  InvestmentCard, 
  FollowersCard 
} from './DashboardCards';

interface ClientDashboardProps {
  data: CompanyData;
}

// Dashboard Houston Academy
export function HoustonDashboard({ data }: ClientDashboardProps) {
  return (
    <>
      <InvestmentCard value={data.investment} />

      <div className="mb-6 animate-fade-in">
        <ViewsCard value={data.impressions} showGrowthIcon={data.impressions > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 stagger-children">
        <CustomMetricCard
          title="Compras no Site"
          value={data.metrics.purchases.results}
          costPerResult={data.metrics.purchases.costPerResult}
          color="primary"
          isExcellent={data.metrics.purchases.costPerResult > 0 && data.metrics.purchases.costPerResult < 40}
          excellentMessage="Resultado Excelente! O custo por compra está abaixo de R$40, indicando alta eficiência na conversão de vendas."
          showGrowthIcon={data.metrics.purchases.results > 0}
        />
        <CustomMetricCard
          title="Leads Gerados"
          value={data.metrics.leads.results}
          costPerResult={data.metrics.leads.costPerResult}
          color="secondary"
          showGrowthIcon={data.metrics.leads.results > 0}
        />
        <CustomMetricCard
          title="Visitas ao Perfil"
          value={data.metrics.profileVisits.results}
          costPerResult={data.metrics.profileVisits.costPerResult}
          color="accent"
          formatAsNumber
          showGrowthIcon={data.metrics.profileVisits.results > 0}
        />
      </div>

      <FollowersCard value={data.followers} showGrowthIcon={data.followers > 0} />
    </>
  );
}

// Dashboard Miguel
export function MiguelDashboard({ data }: ClientDashboardProps) {
  return (
    <>
      <InvestmentCard value={data.investment} />

      <div className="mb-6 animate-fade-in">
        <ViewsCard value={data.impressions} showGrowthIcon={data.impressions > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 stagger-children">
        <CustomMetricCard
          title="Novos Seguidores"
          value={data.followers}
          color="primary"
          showCost={false}
          prefix="+"
          showGrowthIcon={data.followers > 0}
        />
        <CustomMetricCard
          title="Visitas ao Perfil"
          value={data.metrics.profileVisits.results}
          costPerResult={data.metrics.profileVisits.costPerResult}
          color="accent"
          formatAsNumber
          isExcellent={data.metrics.profileVisits.costPerResult > 0 && data.metrics.profileVisits.costPerResult < 0.50}
          excellentMessage="Resultado Excelente! O custo por visita está abaixo de R$0,50, indicando ótima eficiência no engajamento."
          showGrowthIcon={data.metrics.profileVisits.results > 0}
        />
      </div>
    </>
  );
}

// Dashboard Trevo Barbearia
export function TrevoBarbeariaDashboard({ data }: ClientDashboardProps) {
  const visitCost = data.metrics.profileVisits.costPerResult;
  const isSuperExcellent = visitCost > 0 && visitCost < 0.20;
  const isExcellent = visitCost > 0 && visitCost < 0.50 && !isSuperExcellent;

  return (
    <>
      <InvestmentCard value={data.investment} />

      <div className="mb-6 animate-fade-in">
        <ViewsCard value={data.impressions} showGrowthIcon={data.impressions > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 stagger-children">
        <CustomMetricCard
          title="Conversas por Mensagem Iniciadas"
          value={data.metrics.purchases.results}
          costPerResult={data.metrics.purchases.costPerResult}
          color="primary"
          showGrowthIcon={data.metrics.purchases.results > 0}
        />
        <CustomMetricCard
          title="Novos Seguidores"
          value={data.followers}
          color="secondary"
          showCost={false}
          prefix="+"
          showGrowthIcon={data.followers > 0}
        />
        <CustomMetricCard
          title="Visitas ao Perfil"
          value={data.metrics.profileVisits.results}
          costPerResult={data.metrics.profileVisits.costPerResult}
          color="accent"
          formatAsNumber
          isExcellent={isExcellent}
          isSuperExcellent={isSuperExcellent}
          excellentMessage="Resultado Excelente! O custo por visita está abaixo de R$0,50, indicando ótima eficiência no engajamento."
          superExcellentMessage="O custo por visita está ABAIXO de R$0,20! Performance excepcional, continuem assim!"
          showGrowthIcon={data.metrics.profileVisits.results > 0}
        />
      </div>
    </>
  );
}

// Dashboard Trevo Tabacaria
export function TrevoTabacariaDashboard({ data }: ClientDashboardProps) {
  return (
    <>
      <InvestmentCard value={data.investment} />

      <div className="mb-6 animate-fade-in">
        <ViewsCard value={data.impressions} showGrowthIcon={data.impressions > 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 stagger-children">
        <CustomMetricCard
          title="Conversas por Mensagem Iniciadas"
          value={data.metrics.purchases.results}
          costPerResult={data.metrics.purchases.costPerResult}
          color="primary"
          showGrowthIcon={data.metrics.purchases.results > 0}
        />
        <CustomMetricCard
          title="Novos Seguidores"
          value={data.followers}
          color="secondary"
          showCost={false}
          prefix="+"
          showGrowthIcon={data.followers > 0}
        />
      </div>
    </>
  );
}
