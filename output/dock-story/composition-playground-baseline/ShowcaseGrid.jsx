import {
  ActivityCard,
  BillingCard,
  ComposeCard,
  ContactCard,
  ConversationCard,
  FilesCard,
  InboxCard,
  NotesCard,
  PipelineCard,
  PreferencesCard,
  ProjectCard,
  TasksCard,
  TeamCard,
  TransactionsCard,
} from './ShowcaseCards';

import './showcase-grid.css';
import './nexus-showcase.css';

function ComponentsBoard({ projectCard }) {
  return (
    <>
      {projectCard ?? <ProjectCard />}
      <ActivityCard />
      <TeamCard />
      <ConversationCard />
      <PreferencesCard />
    </>
  );
}
function DashboardBoard() {
  return (
    <>
      <TasksCard />
      <ActivityCard />
      <BillingCard />
      <TeamCard />
      <PreferencesCard />
    </>
  );
}
function MailBoard() {
  return (
    <>
      <InboxCard />
      <ComposeCard />
      <TeamCard />
      <FilesCard />
      <PreferencesCard />
    </>
  );
}
function ChatBoard() {
  return (
    <>
      <ConversationCard />
      <TeamCard />
      <TasksCard />
      <NotesCard />
      <FilesCard />
    </>
  );
}
function FinancesBoard() {
  return (
    <>
      <BillingCard />
      <ActivityCard />
      <TransactionsCard />
      <TasksCard />
      <PreferencesCard />
    </>
  );
}
function CrmBoard() {
  return (
    <>
      <ContactCard />
      <PipelineCard />
      <TeamCard />
      <TasksCard />
      <NotesCard />
    </>
  );
}

export function ShowcaseGrid({ view, settings, projectCard }) {
  return (
    <div
      className="story-box-grid showcase-grid nexus-showcase"
      data-showcase-version="nexus"
      data-layout={settings.layout}
      data-treatment={settings.treatment}
      aria-label={`${view} showcase`}
    >
      {view === 'Components' && <ComponentsBoard projectCard={projectCard} />}
      {view === 'Dashboard' && <DashboardBoard />}
      {view === 'Mail' && <MailBoard />}
      {view === 'Chat' && <ChatBoard />}
      {view === 'Finances' && <FinancesBoard />}
      {view === 'CRM' && <CrmBoard />}
    </div>
  );
}
