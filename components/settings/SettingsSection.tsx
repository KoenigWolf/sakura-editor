'use client';

interface SettingsSectionProps {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}

export const SettingsSection = ({ icon: Icon, title, children }: SettingsSectionProps) => {
  return (
    <div className="rounded-lg border bg-card/50 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
};
