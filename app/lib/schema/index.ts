export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_system_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          table_name: string | null
          target_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          table_name?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          table_name?: string | null
          target_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          key: string
          updated_at: string
          updated_by_id: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key: string
          updated_at?: string
          updated_by_id: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          key?: string
          updated_at?: string
          updated_by_id?: string
          value?: Json
        }
        Relationships: []
      }
      admin_system_stats_cache: {
        Row: {
          calculated_at: string
          expires_at: string
          id: string
          stat_data: Json
          stat_type: string
        }
        Insert: {
          calculated_at?: string
          expires_at: string
          id?: string
          stat_data: Json
          stat_type: string
        }
        Update: {
          calculated_at?: string
          expires_at?: string
          id?: string
          stat_data?: Json
          stat_type?: string
        }
        Relationships: []
      }
      app_admin_dashboard_widgets: {
        Row: {
          admin_id: string
          config: Json
          created_at: string
          id: string
          is_visible: boolean
          position: Json
          title: string
          updated_at: string
          widget_type: string
        }
        Insert: {
          admin_id: string
          config: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position: Json
          title: string
          updated_at?: string
          widget_type: string
        }
        Update: {
          admin_id?: string
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          position?: Json
          title?: string
          updated_at?: string
          widget_type?: string
        }
        Relationships: []
      }
      app_admin_security_alerts: {
        Row: {
          admin_id: string | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_resolved: boolean
          metadata: Json | null
          resolved_at: string | null
          resolved_by_id: string | null
          severity: string
          title: string
        }
        Insert: {
          admin_id?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          severity: string
          title: string
        }
        Update: {
          admin_id?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      app_admin_sessions: {
        Row: {
          admin_id: string
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          is_active: boolean
          last_activity: string
          session_token: string
          user_agent: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token: string
          user_agent?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          is_active?: boolean
          last_activity?: string
          session_token?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      app_calendar_meeting_attendees: {
        Row: {
          agent_id: string | null
          client_id: string | null
          created_at: string
          external_email: string | null
          external_name: string | null
          google_calendar_attendee_id: string | null
          id: string
          meeting_id: string
          response_at: string | null
          status: string
        }
        Insert: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          external_email?: string | null
          external_name?: string | null
          google_calendar_attendee_id?: string | null
          id?: string
          meeting_id: string
          response_at?: string | null
          status?: string
        }
        Update: {
          agent_id?: string | null
          client_id?: string | null
          created_at?: string
          external_email?: string | null
          external_name?: string | null
          google_calendar_attendee_id?: string | null
          id?: string
          meeting_id?: string
          response_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_meeting_attendees_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_calendar_meeting_checklists: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          meeting_id: string
          order: number
          text: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          meeting_id: string
          order: number
          text: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          meeting_id?: string
          order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_calendar_meeting_notes: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          is_private: boolean
          meeting_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          content: string
          created_at?: string
          id?: string
          is_private?: boolean
          meeting_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          is_private?: boolean
          meeting_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_meeting_notes_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_calendar_meeting_notes_meeting_id_app_client_meetings_id_fk"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "app_client_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      app_calendar_meeting_reminders: {
        Row: {
          created_at: string
          google_calendar_reminder_id: string | null
          id: string
          is_sent: boolean
          meeting_id: string
          reminder_time: string
          reminder_type: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          sent_at: string | null
        }
        Insert: {
          created_at?: string
          google_calendar_reminder_id?: string | null
          id?: string
          is_sent?: boolean
          meeting_id: string
          reminder_time: string
          reminder_type: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          sent_at?: string | null
        }
        Update: {
          created_at?: string
          google_calendar_reminder_id?: string | null
          id?: string
          is_sent?: boolean
          meeting_id?: string
          reminder_time?: string
          reminder_type?: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          sent_at?: string | null
        }
        Relationships: []
      }
      app_calendar_meeting_templates: {
        Row: {
          agent_id: string
          checklist: Json | null
          created_at: string
          default_duration: number
          default_location: string | null
          description: string | null
          google_calendar_template_id: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          checklist?: Json | null
          created_at?: string
          default_duration?: number
          default_location?: string | null
          description?: string | null
          google_calendar_template_id?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          checklist?: Json | null
          created_at?: string
          default_duration?: number
          default_location?: string | null
          description?: string | null
          google_calendar_template_id?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_meeting_templates_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_calendar_recurring_meetings: {
        Row: {
          created_at: string
          exceptions: Json | null
          google_calendar_recurrence_id: string | null
          id: string
          max_occurrences: number | null
          parent_meeting_id: string
          recurrence_end: string | null
          recurrence_interval: number
          recurrence_type: Database["public"]["Enums"]["app_calendar_recurrence_type_enum"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          exceptions?: Json | null
          google_calendar_recurrence_id?: string | null
          id?: string
          max_occurrences?: number | null
          parent_meeting_id: string
          recurrence_end?: string | null
          recurrence_interval?: number
          recurrence_type: Database["public"]["Enums"]["app_calendar_recurrence_type_enum"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          exceptions?: Json | null
          google_calendar_recurrence_id?: string | null
          id?: string
          max_occurrences?: number | null
          parent_meeting_id?: string
          recurrence_end?: string | null
          recurrence_interval?: number
          recurrence_type?: Database["public"]["Enums"]["app_calendar_recurrence_type_enum"]
          updated_at?: string
        }
        Relationships: []
      }
      app_calendar_settings: {
        Row: {
          agent_id: string
          created_at: string
          default_meeting_duration: number
          default_reminder: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          default_view: Database["public"]["Enums"]["app_calendar_view_enum"]
          google_access_token: string | null
          google_calendar_id: string | null
          google_calendar_sync: boolean
          google_refresh_token: string | null
          google_token_expires_at: string | null
          id: string
          last_sync_at: string | null
          sync_status: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
          time_zone: string
          updated_at: string
          webhook_channel_id: string | null
          webhook_expires_at: string | null
          webhook_resource_id: string | null
          working_hours: Json | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          default_meeting_duration?: number
          default_reminder?: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          default_view?: Database["public"]["Enums"]["app_calendar_view_enum"]
          google_access_token?: string | null
          google_calendar_id?: string | null
          google_calendar_sync?: boolean
          google_refresh_token?: string | null
          google_token_expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_status?: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
          time_zone?: string
          updated_at?: string
          webhook_channel_id?: string | null
          webhook_expires_at?: string | null
          webhook_resource_id?: string | null
          working_hours?: Json | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          default_meeting_duration?: number
          default_reminder?: Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
          default_view?: Database["public"]["Enums"]["app_calendar_view_enum"]
          google_access_token?: string | null
          google_calendar_id?: string | null
          google_calendar_sync?: boolean
          google_refresh_token?: string | null
          google_token_expires_at?: string | null
          id?: string
          last_sync_at?: string | null
          sync_status?: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
          time_zone?: string
          updated_at?: string
          webhook_channel_id?: string | null
          webhook_expires_at?: string | null
          webhook_resource_id?: string | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_settings_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_calendar_sync_logs: {
        Row: {
          agent_id: string
          created_at: string
          error_message: string | null
          external_event_id: string | null
          external_source: Database["public"]["Enums"]["app_calendar_external_source_enum"]
          id: string
          meeting_id: string | null
          sync_direction: string
          sync_result: Json | null
          sync_status: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
        }
        Insert: {
          agent_id: string
          created_at?: string
          error_message?: string | null
          external_event_id?: string | null
          external_source: Database["public"]["Enums"]["app_calendar_external_source_enum"]
          id?: string
          meeting_id?: string | null
          sync_direction: string
          sync_result?: Json | null
          sync_status: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
        }
        Update: {
          agent_id?: string
          created_at?: string
          error_message?: string | null
          external_event_id?: string | null
          external_source?: Database["public"]["Enums"]["app_calendar_external_source_enum"]
          id?: string
          meeting_id?: string | null
          sync_direction?: string
          sync_result?: Json | null
          sync_status?: Database["public"]["Enums"]["app_calendar_sync_status_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "app_calendar_sync_logs_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_calendar_sync_logs_meeting_id_app_client_meetings_id_fk"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "app_client_meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_analytics: {
        Row: {
          acquisition_cost: number | null
          average_response_time: number | null
          client_id: string
          conversion_probability: number | null
          created_at: string
          engagement_score: number | null
          id: string
          last_analyzed_at: string | null
          last_contact_date: string | null
          lifetime_value: number | null
          referral_count: number | null
          referral_value: number | null
          total_contacts: number | null
          updated_at: string
        }
        Insert: {
          acquisition_cost?: number | null
          average_response_time?: number | null
          client_id: string
          conversion_probability?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          last_analyzed_at?: string | null
          last_contact_date?: string | null
          lifetime_value?: number | null
          referral_count?: number | null
          referral_value?: number | null
          total_contacts?: number | null
          updated_at?: string
        }
        Update: {
          acquisition_cost?: number | null
          average_response_time?: number | null
          client_id?: string
          conversion_probability?: number | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          last_analyzed_at?: string | null
          last_contact_date?: string | null
          lifetime_value?: number | null
          referral_count?: number | null
          referral_value?: number | null
          total_contacts?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_analytics_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_checkup_purposes: {
        Row: {
          additional_concerns: string | null
          client_id: string
          created_at: string
          current_savings_location: string | null
          id: string
          is_coverage_concern: boolean
          is_insurance_premium_concern: boolean
          is_medical_history_concern: boolean
          last_updated_by: string
          needs_caregiver_insurance: boolean
          needs_death_benefit: boolean
          needs_dementia_insurance: boolean
          needs_implant_plan: boolean
          priority_level: string | null
          updated_at: string
        }
        Insert: {
          additional_concerns?: string | null
          client_id: string
          created_at?: string
          current_savings_location?: string | null
          id?: string
          is_coverage_concern?: boolean
          is_insurance_premium_concern?: boolean
          is_medical_history_concern?: boolean
          last_updated_by: string
          needs_caregiver_insurance?: boolean
          needs_death_benefit?: boolean
          needs_dementia_insurance?: boolean
          needs_implant_plan?: boolean
          priority_level?: string | null
          updated_at?: string
        }
        Update: {
          additional_concerns?: string | null
          client_id?: string
          created_at?: string
          current_savings_location?: string | null
          id?: string
          is_coverage_concern?: boolean
          is_insurance_premium_concern?: boolean
          is_medical_history_concern?: boolean
          last_updated_by?: string
          needs_caregiver_insurance?: boolean
          needs_death_benefit?: boolean
          needs_dementia_insurance?: boolean
          needs_implant_plan?: boolean
          priority_level?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_checkup_purposes_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_consultation_companions: {
        Row: {
          added_by: string
          client_id: string
          consent_date: string | null
          consent_expiry: string | null
          created_at: string
          id: string
          is_active: boolean
          is_primary: boolean
          name: string
          phone: string
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship: string
          updated_at: string
        }
        Insert: {
          added_by: string
          client_id: string
          consent_date?: string | null
          consent_expiry?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          name: string
          phone: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship: string
          updated_at?: string
        }
        Update: {
          added_by?: string
          client_id?: string
          consent_date?: string | null
          consent_expiry?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_primary?: boolean
          name?: string
          phone?: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_client_consultation_notes: {
        Row: {
          accessible_by: string[] | null
          agent_id: string
          attachments: Json | null
          category: string | null
          client_id: string
          consultation_date: string
          content: string
          contract_details: Json | null
          created_at: string
          follow_up_date: string | null
          follow_up_notes: string | null
          id: string
          importance: string
          is_confidential: boolean
          note_type: string
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          related_contacts: string[] | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          accessible_by?: string[] | null
          agent_id: string
          attachments?: Json | null
          category?: string | null
          client_id: string
          consultation_date: string
          content: string
          contract_details?: Json | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          importance?: string
          is_confidential?: boolean
          note_type: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          related_contacts?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          accessible_by?: string[] | null
          agent_id?: string
          attachments?: Json | null
          category?: string | null
          client_id?: string
          consultation_date?: string
          content?: string
          contract_details?: Json | null
          created_at?: string
          follow_up_date?: string | null
          follow_up_notes?: string | null
          id?: string
          importance?: string
          is_confidential?: boolean
          note_type?: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          related_contacts?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_consultation_notes_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_contact_history: {
        Row: {
          accessible_by: string[] | null
          agent_id: string
          attachments: Json | null
          client_id: string
          contact_method: Database["public"]["Enums"]["app_client_contact_method_enum"]
          content: string | null
          created_at: string
          duration: number | null
          id: string
          is_confidential: boolean
          next_action: string | null
          next_action_date: string | null
          outcome: string | null
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          subject: string | null
        }
        Insert: {
          accessible_by?: string[] | null
          agent_id: string
          attachments?: Json | null
          client_id: string
          contact_method: Database["public"]["Enums"]["app_client_contact_method_enum"]
          content?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          is_confidential?: boolean
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          subject?: string | null
        }
        Update: {
          accessible_by?: string[] | null
          agent_id?: string
          attachments?: Json | null
          client_id?: string
          contact_method?: Database["public"]["Enums"]["app_client_contact_method_enum"]
          content?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          is_confidential?: boolean
          next_action?: string | null
          next_action_date?: string | null
          outcome?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_client_contact_history_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_contact_history_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_contract_attachments: {
        Row: {
          agent_id: string
          contract_id: string
          description: string | null
          document_type: Database["public"]["Enums"]["app_contract_document_type_enum"]
          file_display_name: string
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_active: boolean
          mime_type: string
          uploaded_at: string
        }
        Insert: {
          agent_id: string
          contract_id: string
          description?: string | null
          document_type: Database["public"]["Enums"]["app_contract_document_type_enum"]
          file_display_name: string
          file_name: string
          file_path: string
          file_size: number
          id?: string
          is_active?: boolean
          mime_type: string
          uploaded_at?: string
        }
        Update: {
          agent_id?: string
          contract_id?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["app_contract_document_type_enum"]
          file_display_name?: string
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_active?: boolean
          mime_type?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      app_client_data_access_logs: {
        Row: {
          access_result: string | null
          access_type: Database["public"]["Enums"]["app_client_data_access_log_type_enum"]
          accessed_at: string
          accessed_by: string
          accessed_data: string[] | null
          client_id: string
          id: string
          ip_address: string | null
          metadata: Json | null
          purpose: string | null
          user_agent: string | null
        }
        Insert: {
          access_result?: string | null
          access_type: Database["public"]["Enums"]["app_client_data_access_log_type_enum"]
          accessed_at?: string
          accessed_by: string
          accessed_data?: string[] | null
          client_id: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          purpose?: string | null
          user_agent?: string | null
        }
        Update: {
          access_result?: string | null
          access_type?: Database["public"]["Enums"]["app_client_data_access_log_type_enum"]
          accessed_at?: string
          accessed_by?: string
          accessed_data?: string[] | null
          client_id?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          purpose?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_client_data_access_logs_accessed_by_app_user_profiles_id_fk"
            columns: ["accessed_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_data_access_logs_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_data_backups: {
        Row: {
          backup_data: Json
          backup_hash: string
          backup_type: string
          client_id: string
          created_at: string
          encryption_key: string | null
          id: string
          is_encrypted: boolean
          retention_until: string
          trigger_reason: string | null
          triggered_by: string
        }
        Insert: {
          backup_data: Json
          backup_hash: string
          backup_type: string
          client_id: string
          created_at?: string
          encryption_key?: string | null
          id?: string
          is_encrypted?: boolean
          retention_until: string
          trigger_reason?: string | null
          triggered_by: string
        }
        Update: {
          backup_data?: Json
          backup_hash?: string
          backup_type?: string
          client_id?: string
          created_at?: string
          encryption_key?: string | null
          id?: string
          is_encrypted?: boolean
          retention_until?: string
          trigger_reason?: string | null
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_data_backups_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_data_backups_triggered_by_app_user_profiles_id_fk"
            columns: ["triggered_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_details: {
        Row: {
          bank_account: string | null
          birth_date: string | null
          client_id: string
          created_at: string
          emergency_contact: string | null
          emergency_phone: string | null
          gender: Database["public"]["Enums"]["app_gender_enum"] | null
          id: string
          medical_history: string | null
          ssn: string | null
          updated_at: string
        }
        Insert: {
          bank_account?: string | null
          birth_date?: string | null
          client_id: string
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: Database["public"]["Enums"]["app_gender_enum"] | null
          id?: string
          medical_history?: string | null
          ssn?: string | null
          updated_at?: string
        }
        Update: {
          bank_account?: string | null
          birth_date?: string | null
          client_id?: string
          created_at?: string
          emergency_contact?: string | null
          emergency_phone?: string | null
          gender?: Database["public"]["Enums"]["app_gender_enum"] | null
          id?: string
          medical_history?: string | null
          ssn?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_details_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_documents: {
        Row: {
          agent_id: string
          client_id: string
          created_at: string
          description: string | null
          document_type: Database["public"]["Enums"]["app_document_type_enum"]
          file_name: string
          file_path: string
          id: string
          insurance_info_id: string | null
          is_active: boolean
          mime_type: string
          size: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_id: string
          created_at?: string
          description?: string | null
          document_type: Database["public"]["Enums"]["app_document_type_enum"]
          file_name: string
          file_path: string
          id?: string
          insurance_info_id?: string | null
          is_active?: boolean
          mime_type: string
          size: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_id?: string
          created_at?: string
          description?: string | null
          document_type?: Database["public"]["Enums"]["app_document_type_enum"]
          file_name?: string
          file_path?: string
          id?: string
          insurance_info_id?: string | null
          is_active?: boolean
          mime_type?: string
          size?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_documents_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_documents_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_family_members: {
        Row: {
          birth_date: string | null
          client_id: string
          consent_date: string | null
          consent_expiry: string | null
          created_at: string
          email: string | null
          gender: string | null
          has_insurance: boolean | null
          id: string
          insurance_details: Json | null
          name: string
          notes: string | null
          occupation: string | null
          phone: string | null
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          client_id: string
          consent_date?: string | null
          consent_expiry?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_details?: Json | null
          name: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          client_id?: string
          consent_date?: string | null
          consent_expiry?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          has_insurance?: boolean | null
          id?: string
          insurance_details?: Json | null
          name?: string
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          relationship?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_family_members_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_insurance: {
        Row: {
          beneficiary: string | null
          client_id: string
          coverage_amount: number | null
          created_at: string
          end_date: string | null
          id: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          insurer: string | null
          is_active: boolean
          policy_number: string | null
          premium: number | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          beneficiary?: string | null
          client_id: string
          coverage_amount?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          insurer?: string | null
          is_active?: boolean
          policy_number?: string | null
          premium?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          beneficiary?: string | null
          client_id?: string
          coverage_amount?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          insurance_type?: Database["public"]["Enums"]["app_insurance_type_enum"]
          insurer?: string | null
          is_active?: boolean
          policy_number?: string | null
          premium?: number | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_insurance_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_insurance_contracts: {
        Row: {
          agent_commission: number | null
          agent_id: string
          annual_premium: number | null
          beneficiary_name: string | null
          client_id: string
          contract_date: string
          contract_number: string | null
          contractor_name: string
          contractor_phone: string | null
          contractor_ssn: string | null
          contractor_ssn_encrypted: string | null
          coverage_amount: number | null
          created_at: string
          effective_date: string
          expiration_date: string | null
          id: string
          insurance_code: string | null
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          insured_name: string
          insured_phone: string | null
          insured_ssn: string | null
          insured_ssn_encrypted: string | null
          internal_notes: string | null
          is_renewal_contract: boolean
          monthly_premium: number | null
          notes: string | null
          opportunity_product_id: string | null
          parent_contract_id: string | null
          payment_cycle:
            | Database["public"]["Enums"]["app_payment_cycle_enum"]
            | null
          payment_due_date: string | null
          payment_method: string | null
          payment_period: number | null
          policy_number: string | null
          premium_amount: number | null
          product_name: string
          special_clauses: string | null
          status: Database["public"]["Enums"]["app_contract_status_enum"]
          updated_at: string
        }
        Insert: {
          agent_commission?: number | null
          agent_id: string
          annual_premium?: number | null
          beneficiary_name?: string | null
          client_id: string
          contract_date: string
          contract_number?: string | null
          contractor_name: string
          contractor_phone?: string | null
          contractor_ssn?: string | null
          contractor_ssn_encrypted?: string | null
          coverage_amount?: number | null
          created_at?: string
          effective_date: string
          expiration_date?: string | null
          id?: string
          insurance_code?: string | null
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          insured_name: string
          insured_phone?: string | null
          insured_ssn?: string | null
          insured_ssn_encrypted?: string | null
          internal_notes?: string | null
          is_renewal_contract?: boolean
          monthly_premium?: number | null
          notes?: string | null
          opportunity_product_id?: string | null
          parent_contract_id?: string | null
          payment_cycle?:
            | Database["public"]["Enums"]["app_payment_cycle_enum"]
            | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_period?: number | null
          policy_number?: string | null
          premium_amount?: number | null
          product_name: string
          special_clauses?: string | null
          status?: Database["public"]["Enums"]["app_contract_status_enum"]
          updated_at?: string
        }
        Update: {
          agent_commission?: number | null
          agent_id?: string
          annual_premium?: number | null
          beneficiary_name?: string | null
          client_id?: string
          contract_date?: string
          contract_number?: string | null
          contractor_name?: string
          contractor_phone?: string | null
          contractor_ssn?: string | null
          contractor_ssn_encrypted?: string | null
          coverage_amount?: number | null
          created_at?: string
          effective_date?: string
          expiration_date?: string | null
          id?: string
          insurance_code?: string | null
          insurance_company?: string
          insurance_type?: Database["public"]["Enums"]["app_insurance_type_enum"]
          insured_name?: string
          insured_phone?: string | null
          insured_ssn?: string | null
          insured_ssn_encrypted?: string | null
          internal_notes?: string | null
          is_renewal_contract?: boolean
          monthly_premium?: number | null
          notes?: string | null
          opportunity_product_id?: string | null
          parent_contract_id?: string | null
          payment_cycle?:
            | Database["public"]["Enums"]["app_payment_cycle_enum"]
            | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_period?: number | null
          policy_number?: string | null
          premium_amount?: number | null
          product_name?: string
          special_clauses?: string | null
          status?: Database["public"]["Enums"]["app_contract_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_insurance_contracts_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_interest_categories: {
        Row: {
          additional_interests: string[] | null
          client_id: string
          created_at: string
          id: string
          interest_notes: string | null
          interested_in_accident_insurance: boolean
          interested_in_auto_insurance: boolean
          interested_in_cancer: boolean
          interested_in_caregiver: boolean
          interested_in_dementia: boolean
          interested_in_dental: boolean
          interested_in_driver_insurance: boolean
          interested_in_fire_insurance: boolean
          interested_in_health_checkup: boolean
          interested_in_investment: boolean
          interested_in_legal_advice: boolean
          interested_in_liability: boolean
          interested_in_medical_expenses: boolean
          interested_in_pet_insurance: boolean
          interested_in_savings: boolean
          interested_in_tax: boolean
          interested_in_traffic_accident: boolean
          last_updated_by: string
          updated_at: string
        }
        Insert: {
          additional_interests?: string[] | null
          client_id: string
          created_at?: string
          id?: string
          interest_notes?: string | null
          interested_in_accident_insurance?: boolean
          interested_in_auto_insurance?: boolean
          interested_in_cancer?: boolean
          interested_in_caregiver?: boolean
          interested_in_dementia?: boolean
          interested_in_dental?: boolean
          interested_in_driver_insurance?: boolean
          interested_in_fire_insurance?: boolean
          interested_in_health_checkup?: boolean
          interested_in_investment?: boolean
          interested_in_legal_advice?: boolean
          interested_in_liability?: boolean
          interested_in_medical_expenses?: boolean
          interested_in_pet_insurance?: boolean
          interested_in_savings?: boolean
          interested_in_tax?: boolean
          interested_in_traffic_accident?: boolean
          last_updated_by: string
          updated_at?: string
        }
        Update: {
          additional_interests?: string[] | null
          client_id?: string
          created_at?: string
          id?: string
          interest_notes?: string | null
          interested_in_accident_insurance?: boolean
          interested_in_auto_insurance?: boolean
          interested_in_cancer?: boolean
          interested_in_caregiver?: boolean
          interested_in_dementia?: boolean
          interested_in_dental?: boolean
          interested_in_driver_insurance?: boolean
          interested_in_fire_insurance?: boolean
          interested_in_health_checkup?: boolean
          interested_in_investment?: boolean
          interested_in_legal_advice?: boolean
          interested_in_liability?: boolean
          interested_in_medical_expenses?: boolean
          interested_in_pet_insurance?: boolean
          interested_in_savings?: boolean
          interested_in_tax?: boolean
          interested_in_traffic_accident?: boolean
          last_updated_by?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_client_medical_history: {
        Row: {
          additional_exam_details: string | null
          client_id: string
          consent_date: string | null
          created_at: string
          has_additional_exam: boolean
          has_long_term_medication: boolean
          has_long_term_treatment: boolean
          has_major_hospitalization: boolean
          has_major_surgery: boolean
          has_recent_diagnosis: boolean
          has_recent_hospitalization: boolean
          has_recent_medication: boolean
          has_recent_surgery: boolean
          has_recent_suspicion: boolean
          has_recent_treatment: boolean
          id: string
          last_updated_by: string
          major_medical_details: string | null
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          recent_medical_details: string | null
          updated_at: string
        }
        Insert: {
          additional_exam_details?: string | null
          client_id: string
          consent_date?: string | null
          created_at?: string
          has_additional_exam?: boolean
          has_long_term_medication?: boolean
          has_long_term_treatment?: boolean
          has_major_hospitalization?: boolean
          has_major_surgery?: boolean
          has_recent_diagnosis?: boolean
          has_recent_hospitalization?: boolean
          has_recent_medication?: boolean
          has_recent_surgery?: boolean
          has_recent_suspicion?: boolean
          has_recent_treatment?: boolean
          id?: string
          last_updated_by: string
          major_medical_details?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          recent_medical_details?: string | null
          updated_at?: string
        }
        Update: {
          additional_exam_details?: string | null
          client_id?: string
          consent_date?: string | null
          created_at?: string
          has_additional_exam?: boolean
          has_long_term_medication?: boolean
          has_long_term_treatment?: boolean
          has_major_hospitalization?: boolean
          has_major_surgery?: boolean
          has_recent_diagnosis?: boolean
          has_recent_hospitalization?: boolean
          has_recent_medication?: boolean
          has_recent_surgery?: boolean
          has_recent_suspicion?: boolean
          has_recent_treatment?: boolean
          id?: string
          last_updated_by?: string
          major_medical_details?: string | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          recent_medical_details?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_medical_history_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_meetings: {
        Row: {
          agent_id: string
          client_id: string | null
          contact_method:
            | Database["public"]["Enums"]["app_meeting_contact_method_enum"]
            | null
          created_at: string
          description: string | null
          duration: number
          estimated_commission: number | null
          expected_outcome:
            | Database["public"]["Enums"]["app_meeting_expected_outcome_enum"]
            | null
          google_meet_enabled: boolean | null
          google_meet_link: string | null
          id: string
          location: string | null
          meeting_type:
            | Database["public"]["Enums"]["app_meeting_type_enum"]
            | null
          notes: string | null
          priority:
            | Database["public"]["Enums"]["app_meeting_priority_enum"]
            | null
          product_interest:
            | Database["public"]["Enums"]["app_meeting_product_interest_enum"]
            | null
          reminder:
            | Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
            | null
          scheduled_at: string
          send_client_invite: boolean | null
          status: Database["public"]["Enums"]["app_meeting_status_enum"]
          sync_to_google: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_id?: string | null
          contact_method?:
            | Database["public"]["Enums"]["app_meeting_contact_method_enum"]
            | null
          created_at?: string
          description?: string | null
          duration?: number
          estimated_commission?: number | null
          expected_outcome?:
            | Database["public"]["Enums"]["app_meeting_expected_outcome_enum"]
            | null
          google_meet_enabled?: boolean | null
          google_meet_link?: string | null
          id?: string
          location?: string | null
          meeting_type?:
            | Database["public"]["Enums"]["app_meeting_type_enum"]
            | null
          notes?: string | null
          priority?:
            | Database["public"]["Enums"]["app_meeting_priority_enum"]
            | null
          product_interest?:
            | Database["public"]["Enums"]["app_meeting_product_interest_enum"]
            | null
          reminder?:
            | Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
            | null
          scheduled_at: string
          send_client_invite?: boolean | null
          status?: Database["public"]["Enums"]["app_meeting_status_enum"]
          sync_to_google?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_id?: string | null
          contact_method?:
            | Database["public"]["Enums"]["app_meeting_contact_method_enum"]
            | null
          created_at?: string
          description?: string | null
          duration?: number
          estimated_commission?: number | null
          expected_outcome?:
            | Database["public"]["Enums"]["app_meeting_expected_outcome_enum"]
            | null
          google_meet_enabled?: boolean | null
          google_meet_link?: string | null
          id?: string
          location?: string | null
          meeting_type?:
            | Database["public"]["Enums"]["app_meeting_type_enum"]
            | null
          notes?: string | null
          priority?:
            | Database["public"]["Enums"]["app_meeting_priority_enum"]
            | null
          product_interest?:
            | Database["public"]["Enums"]["app_meeting_product_interest_enum"]
            | null
          reminder?:
            | Database["public"]["Enums"]["app_calendar_reminder_type_enum"]
            | null
          scheduled_at?: string
          send_client_invite?: boolean | null
          status?: Database["public"]["Enums"]["app_meeting_status_enum"]
          sync_to_google?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_meetings_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_meetings_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_milestones: {
        Row: {
          achieved_at: string
          agent_id: string
          category: string | null
          client_id: string
          created_at: string
          description: string | null
          id: string
          is_significant: boolean
          metadata: Json | null
          title: string
          value: number | null
        }
        Insert: {
          achieved_at: string
          agent_id: string
          category?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_significant?: boolean
          metadata?: Json | null
          title: string
          value?: number | null
        }
        Update: {
          achieved_at?: string
          agent_id?: string
          category?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_significant?: boolean
          metadata?: Json | null
          title?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_client_milestones_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_milestones_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_preferences: {
        Row: {
          budget: Json | null
          client_id: string
          communication_style: string | null
          concerns: string[] | null
          created_at: string
          data_processing_consent: boolean
          id: string
          interests: string[] | null
          investment_goals: string[] | null
          marketing_consent: boolean
          notes: string | null
          preferred_contact_method:
            | Database["public"]["Enums"]["app_client_contact_method_enum"]
            | null
          preferred_contact_time: Json | null
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          risk_tolerance: string | null
          special_needs: string | null
          third_party_share_consent: boolean
          updated_at: string
        }
        Insert: {
          budget?: Json | null
          client_id: string
          communication_style?: string | null
          concerns?: string[] | null
          created_at?: string
          data_processing_consent?: boolean
          id?: string
          interests?: string[] | null
          investment_goals?: string[] | null
          marketing_consent?: boolean
          notes?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["app_client_contact_method_enum"]
            | null
          preferred_contact_time?: Json | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          risk_tolerance?: string | null
          special_needs?: string | null
          third_party_share_consent?: boolean
          updated_at?: string
        }
        Update: {
          budget?: Json | null
          client_id?: string
          communication_style?: string | null
          concerns?: string[] | null
          created_at?: string
          data_processing_consent?: boolean
          id?: string
          interests?: string[] | null
          investment_goals?: string[] | null
          marketing_consent?: boolean
          notes?: string | null
          preferred_contact_method?:
            | Database["public"]["Enums"]["app_client_contact_method_enum"]
            | null
          preferred_contact_time?: Json | null
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          risk_tolerance?: string | null
          special_needs?: string | null
          third_party_share_consent?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_preferences_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_profiles: {
        Row: {
          address: string | null
          agent_id: string
          created_at: string
          current_stage_id: string
          custom_fields: Json | null
          email: string | null
          full_name: string
          has_driving_license: boolean | null
          height: number | null
          id: string
          importance: Database["public"]["Enums"]["app_importance_enum"]
          is_active: boolean
          notes: string | null
          occupation: string | null
          phone: string | null
          referred_by_id: string | null
          stage_order: number
          tags: string[] | null
          team_id: string | null
          telecom_provider: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          address?: string | null
          agent_id: string
          created_at?: string
          current_stage_id: string
          custom_fields?: Json | null
          email?: string | null
          full_name: string
          has_driving_license?: boolean | null
          height?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["app_importance_enum"]
          is_active?: boolean
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          referred_by_id?: string | null
          stage_order?: number
          tags?: string[] | null
          team_id?: string | null
          telecom_provider?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          address?: string | null
          agent_id?: string
          created_at?: string
          current_stage_id?: string
          custom_fields?: Json | null
          email?: string | null
          full_name?: string
          has_driving_license?: boolean | null
          height?: number | null
          id?: string
          importance?: Database["public"]["Enums"]["app_importance_enum"]
          is_active?: boolean
          notes?: string | null
          occupation?: string | null
          phone?: string | null
          referred_by_id?: string | null
          stage_order?: number
          tags?: string[] | null
          team_id?: string | null
          telecom_provider?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_client_profiles_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_profiles_current_stage_id_app_pipeline_stages_id_fk"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "app_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_profiles_referred_by_id_app_client_profiles_id_fk"
            columns: ["referred_by_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_profiles_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_referrals: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          notes: string | null
          referral_date: string
          referred_id: string
          referrer_id: string
          status: Database["public"]["Enums"]["app_referral_status_enum"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          notes?: string | null
          referral_date?: string
          referred_id: string
          referrer_id: string
          status?: Database["public"]["Enums"]["app_referral_status_enum"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          referral_date?: string
          referred_id?: string
          referrer_id?: string
          status?: Database["public"]["Enums"]["app_referral_status_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_referrals_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_referrals_referred_id_app_client_profiles_id_fk"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_referrals_referrer_id_app_client_profiles_id_fk"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_stage_history: {
        Row: {
          agent_id: string
          changed_at: string
          client_id: string
          from_stage_id: string | null
          id: string
          notes: string | null
          reason: string | null
          to_stage_id: string
        }
        Insert: {
          agent_id: string
          changed_at?: string
          client_id: string
          from_stage_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          to_stage_id: string
        }
        Update: {
          agent_id?: string
          changed_at?: string
          client_id?: string
          from_stage_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_stage_history_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_stage_history_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_stage_history_to_stage_id_app_pipeline_stages_id_fk"
            columns: ["to_stage_id"]
            isOneToOne: false
            referencedRelation: "app_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_tag_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          client_id: string
          id: string
          tag_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          client_id: string
          id?: string
          tag_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          client_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_tag_assignments_assigned_by_app_user_profiles_id_fk"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_tag_assignments_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_client_tag_assignments_tag_id_app_client_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "app_client_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      app_client_tags: {
        Row: {
          agent_id: string
          color: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          privacy_level: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          updated_at: string
        }
        Insert: {
          agent_id: string
          color: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          updated_at?: string
        }
        Update: {
          agent_id?: string
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          privacy_level?: Database["public"]["Enums"]["app_client_privacy_level_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_client_tags_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["app_dashboard_activity_type_enum"]
          created_at: string
          description: string
          entity_id: string | null
          entity_type: string | null
          id: string
          impact: string | null
          ip_address: string | null
          metadata: Json | null
          title: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["app_dashboard_activity_type_enum"]
          created_at?: string
          description: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          impact?: string | null
          ip_address?: string | null
          metadata?: Json | null
          title: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["app_dashboard_activity_type_enum"]
          created_at?: string
          description?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          impact?: string | null
          ip_address?: string | null
          metadata?: Json | null
          title?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_activity_logs_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_goals: {
        Row: {
          achieved_at: string | null
          agent_id: string
          created_at: string
          current_value: number
          description: string | null
          end_date: string
          goal_type: Database["public"]["Enums"]["app_dashboard_goal_type_enum"]
          id: string
          is_achieved: boolean
          is_active: boolean
          metadata: Json | null
          period: Database["public"]["Enums"]["app_dashboard_goal_period_enum"]
          progress_percentage: number
          start_date: string
          target_value: number
          team_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          agent_id: string
          created_at?: string
          current_value?: number
          description?: string | null
          end_date: string
          goal_type: Database["public"]["Enums"]["app_dashboard_goal_type_enum"]
          id?: string
          is_achieved?: boolean
          is_active?: boolean
          metadata?: Json | null
          period: Database["public"]["Enums"]["app_dashboard_goal_period_enum"]
          progress_percentage?: number
          start_date: string
          target_value: number
          team_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          agent_id?: string
          created_at?: string
          current_value?: number
          description?: string | null
          end_date?: string
          goal_type?: Database["public"]["Enums"]["app_dashboard_goal_type_enum"]
          id?: string
          is_achieved?: boolean
          is_active?: boolean
          metadata?: Json | null
          period?: Database["public"]["Enums"]["app_dashboard_goal_period_enum"]
          progress_percentage?: number
          start_date?: string
          target_value?: number
          team_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_goals_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_dashboard_goals_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["app_dashboard_notification_priority_enum"]
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["app_dashboard_notification_type_enum"]
          user_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["app_dashboard_notification_priority_enum"]
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["app_dashboard_notification_type_enum"]
          user_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["app_dashboard_notification_priority_enum"]
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["app_dashboard_notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_notifications_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_performance_metrics: {
        Row: {
          agent_id: string
          average_deal_size: number
          calculated_at: string
          cancelled_meetings: number
          completed_meetings: number
          conversion_rate: number
          converted_referrals: number
          created_at: string
          data_version: number
          date: string
          id: string
          is_verified: boolean
          new_clients: number
          new_referrals: number
          period: Database["public"]["Enums"]["app_dashboard_metric_period_enum"]
          pipeline_value: number
          team_id: string | null
          total_meetings: number
          total_revenue: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          average_deal_size?: number
          calculated_at?: string
          cancelled_meetings?: number
          completed_meetings?: number
          conversion_rate?: number
          converted_referrals?: number
          created_at?: string
          data_version?: number
          date: string
          id?: string
          is_verified?: boolean
          new_clients?: number
          new_referrals?: number
          period: Database["public"]["Enums"]["app_dashboard_metric_period_enum"]
          pipeline_value?: number
          team_id?: string | null
          total_meetings?: number
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          average_deal_size?: number
          calculated_at?: string
          cancelled_meetings?: number
          completed_meetings?: number
          conversion_rate?: number
          converted_referrals?: number
          created_at?: string
          data_version?: number
          date?: string
          id?: string
          is_verified?: boolean
          new_clients?: number
          new_referrals?: number
          period?: Database["public"]["Enums"]["app_dashboard_metric_period_enum"]
          pipeline_value?: number
          team_id?: string | null
          total_meetings?: number
          total_revenue?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_performance_metrics_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_quick_actions: {
        Row: {
          action_type: string
          action_url: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          last_used: string | null
          order: number
          shortcut: string | null
          title: string
          updated_at: string
          usage_count: number
          user_id: string
        }
        Insert: {
          action_type: string
          action_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          last_used?: string | null
          order?: number
          shortcut?: string | null
          title: string
          updated_at?: string
          usage_count?: number
          user_id: string
        }
        Update: {
          action_type?: string
          action_url?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          last_used?: string | null
          order?: number
          shortcut?: string | null
          title?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_quick_actions_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_dashboard_widgets: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_visible: boolean
          last_refreshed: string | null
          order: number
          position: Json
          refresh_interval: number | null
          title: string
          updated_at: string
          user_id: string
          widget_type: Database["public"]["Enums"]["app_dashboard_widget_type_enum"]
        }
        Insert: {
          config: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          last_refreshed?: string | null
          order?: number
          position: Json
          refresh_interval?: number | null
          title: string
          updated_at?: string
          user_id: string
          widget_type: Database["public"]["Enums"]["app_dashboard_widget_type_enum"]
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_visible?: boolean
          last_refreshed?: string | null
          order?: number
          position?: Json
          refresh_interval?: number | null
          title?: string
          updated_at?: string
          user_id?: string
          widget_type?: Database["public"]["Enums"]["app_dashboard_widget_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "app_dashboard_widgets_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_influencer_activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["app_influencer_activity_type_enum"]
          agent_id: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          impact: string | null
          influencer_id: string
          metadata: Json | null
          new_value: number | null
          previous_value: number | null
          title: string
          value_change: number | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["app_influencer_activity_type_enum"]
          agent_id: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          impact?: string | null
          influencer_id: string
          metadata?: Json | null
          new_value?: number | null
          previous_value?: number | null
          title: string
          value_change?: number | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["app_influencer_activity_type_enum"]
          agent_id?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          impact?: string | null
          influencer_id?: string
          metadata?: Json | null
          new_value?: number | null
          previous_value?: number | null
          title?: string
          value_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_influencer_activity_logs_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_influencer_gratitude_history: {
        Row: {
          agent_id: string
          cost: number | null
          created_at: string
          delivered_date: string | null
          delivery_confirmed: boolean
          gift_type: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id: string
          influencer_id: string
          internal_notes: string | null
          is_auto_generated: boolean
          is_recurring: boolean
          message: string
          metadata: Json | null
          next_scheduled_date: string | null
          personalized_message: string | null
          recipient_feedback: string | null
          recurring_interval: number | null
          referral_id: string | null
          scheduled_date: string | null
          sent_date: string | null
          sentiment: string | null
          status: Database["public"]["Enums"]["app_influencer_gratitude_status_enum"]
          template_id: string | null
          title: string
          tracking_number: string | null
          updated_at: string
          vendor: string | null
        }
        Insert: {
          agent_id: string
          cost?: number | null
          created_at?: string
          delivered_date?: string | null
          delivery_confirmed?: boolean
          gift_type?: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id?: string
          influencer_id: string
          internal_notes?: string | null
          is_auto_generated?: boolean
          is_recurring?: boolean
          message: string
          metadata?: Json | null
          next_scheduled_date?: string | null
          personalized_message?: string | null
          recipient_feedback?: string | null
          recurring_interval?: number | null
          referral_id?: string | null
          scheduled_date?: string | null
          sent_date?: string | null
          sentiment?: string | null
          status?: Database["public"]["Enums"]["app_influencer_gratitude_status_enum"]
          template_id?: string | null
          title: string
          tracking_number?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Update: {
          agent_id?: string
          cost?: number | null
          created_at?: string
          delivered_date?: string | null
          delivery_confirmed?: boolean
          gift_type?: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type?: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id?: string
          influencer_id?: string
          internal_notes?: string | null
          is_auto_generated?: boolean
          is_recurring?: boolean
          message?: string
          metadata?: Json | null
          next_scheduled_date?: string | null
          personalized_message?: string | null
          recipient_feedback?: string | null
          recurring_interval?: number | null
          referral_id?: string | null
          scheduled_date?: string | null
          sent_date?: string | null
          sentiment?: string | null
          status?: Database["public"]["Enums"]["app_influencer_gratitude_status_enum"]
          template_id?: string | null
          title?: string
          tracking_number?: string | null
          updated_at?: string
          vendor?: string | null
        }
        Relationships: []
      }
      app_influencer_gratitude_templates: {
        Row: {
          agent_id: string
          created_at: string
          gift_type: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id: string
          is_active: boolean
          is_default: boolean
          last_used: string | null
          message_template: string
          metadata: Json | null
          name: string
          placeholders: string[] | null
          title: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          agent_id: string
          created_at?: string
          gift_type?: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_used?: string | null
          message_template: string
          metadata?: Json | null
          name: string
          placeholders?: string[] | null
          title: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          agent_id?: string
          created_at?: string
          gift_type?: Database["public"]["Enums"]["app_influencer_gift_type_enum"]
          gratitude_type?: Database["public"]["Enums"]["app_influencer_gratitude_type_enum"]
          id?: string
          is_active?: boolean
          is_default?: boolean
          last_used?: string | null
          message_template?: string
          metadata?: Json | null
          name?: string
          placeholders?: string[] | null
          title?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      app_influencer_network_analysis: {
        Row: {
          active_influencers: number
          agent_id: string
          analysis_date: string
          analysis_period: string
          average_conversion_rate: number
          average_gratitude_frequency: number
          average_network_depth: number
          average_network_width: number
          average_relationship_strength: number
          calculated_at: string
          calculation_version: string
          confidence_level: number
          created_at: string
          data_quality_score: number
          expires_at: string
          id: string
          missing_data_fields: string[] | null
          network_growth_rate: number
          team_id: string | null
          top_influencer_ids: string[] | null
          total_gratitudes_sent: number
          total_influencers: number
          total_network_value: number
        }
        Insert: {
          active_influencers?: number
          agent_id: string
          analysis_date: string
          analysis_period: string
          average_conversion_rate?: number
          average_gratitude_frequency?: number
          average_network_depth?: number
          average_network_width?: number
          average_relationship_strength?: number
          calculated_at?: string
          calculation_version?: string
          confidence_level?: number
          created_at?: string
          data_quality_score?: number
          expires_at: string
          id?: string
          missing_data_fields?: string[] | null
          network_growth_rate?: number
          team_id?: string | null
          top_influencer_ids?: string[] | null
          total_gratitudes_sent?: number
          total_influencers?: number
          total_network_value?: number
        }
        Update: {
          active_influencers?: number
          agent_id?: string
          analysis_date?: string
          analysis_period?: string
          average_conversion_rate?: number
          average_gratitude_frequency?: number
          average_network_depth?: number
          average_network_width?: number
          average_relationship_strength?: number
          calculated_at?: string
          calculation_version?: string
          confidence_level?: number
          created_at?: string
          data_quality_score?: number
          expires_at?: string
          id?: string
          missing_data_fields?: string[] | null
          network_growth_rate?: number
          team_id?: string | null
          top_influencer_ids?: string[] | null
          total_gratitudes_sent?: number
          total_influencers?: number
          total_network_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_influencer_network_analysis_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_influencer_profiles: {
        Row: {
          agent_id: string
          average_contract_value: number
          client_id: string
          conversion_rate: number
          created_at: string
          data_source: Database["public"]["Enums"]["app_influencer_data_source_enum"]
          data_version: number
          id: string
          is_active: boolean
          is_data_verified: boolean
          last_calculated_at: string
          last_contact_date: string | null
          last_gratitude_date: string | null
          last_referral_date: string | null
          network_depth: number
          network_width: number
          preferred_contact_method:
            | Database["public"]["Enums"]["app_influencer_contact_method_enum"]
            | null
          relationship_strength: number
          special_notes: string | null
          successful_referrals: number
          tier: Database["public"]["Enums"]["app_influencer_tier_enum"]
          total_contract_value: number
          total_referrals: number
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          agent_id: string
          average_contract_value?: number
          client_id: string
          conversion_rate?: number
          created_at?: string
          data_source?: Database["public"]["Enums"]["app_influencer_data_source_enum"]
          data_version?: number
          id?: string
          is_active?: boolean
          is_data_verified?: boolean
          last_calculated_at?: string
          last_contact_date?: string | null
          last_gratitude_date?: string | null
          last_referral_date?: string | null
          network_depth?: number
          network_width?: number
          preferred_contact_method?:
            | Database["public"]["Enums"]["app_influencer_contact_method_enum"]
            | null
          relationship_strength?: number
          special_notes?: string | null
          successful_referrals?: number
          tier?: Database["public"]["Enums"]["app_influencer_tier_enum"]
          total_contract_value?: number
          total_referrals?: number
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          agent_id?: string
          average_contract_value?: number
          client_id?: string
          conversion_rate?: number
          created_at?: string
          data_source?: Database["public"]["Enums"]["app_influencer_data_source_enum"]
          data_version?: number
          id?: string
          is_active?: boolean
          is_data_verified?: boolean
          last_calculated_at?: string
          last_contact_date?: string | null
          last_gratitude_date?: string | null
          last_referral_date?: string | null
          network_depth?: number
          network_width?: number
          preferred_contact_method?:
            | Database["public"]["Enums"]["app_influencer_contact_method_enum"]
            | null
          relationship_strength?: number
          special_notes?: string | null
          successful_referrals?: number
          tier?: Database["public"]["Enums"]["app_influencer_tier_enum"]
          total_contract_value?: number
          total_referrals?: number
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_influencer_profiles_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_influencer_profiles_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_influencer_profiles_verified_by_app_user_profiles_id_fk"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_invitation_usage_logs: {
        Row: {
          action: Database["public"]["Enums"]["usage_action"]
          created_at: string
          id: string
          invitation_id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["usage_action"]
          created_at?: string
          id?: string
          invitation_id: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["usage_action"]
          created_at?: string
          id?: string
          invitation_id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_invitation_usage_logs_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_network_edges: {
        Row: {
          agent_id: string
          bidirectional: boolean
          connection_type: Database["public"]["Enums"]["app_network_connection_type_enum"]
          created_at: string
          description: string | null
          established_date: string | null
          id: string
          interaction_count: number
          is_active: boolean
          last_interaction: string | null
          metadata: Json | null
          source_node_id: string
          strength: number
          target_node_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          bidirectional?: boolean
          connection_type: Database["public"]["Enums"]["app_network_connection_type_enum"]
          created_at?: string
          description?: string | null
          established_date?: string | null
          id?: string
          interaction_count?: number
          is_active?: boolean
          last_interaction?: string | null
          metadata?: Json | null
          source_node_id: string
          strength?: number
          target_node_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          bidirectional?: boolean
          connection_type?: Database["public"]["Enums"]["app_network_connection_type_enum"]
          created_at?: string
          description?: string | null
          established_date?: string | null
          id?: string
          interaction_count?: number
          is_active?: boolean
          last_interaction?: string | null
          metadata?: Json | null
          source_node_id?: string
          strength?: number
          target_node_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_network_edges_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_network_edges_source_node_id_app_network_nodes_id_fk"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "app_network_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_network_edges_target_node_id_app_network_nodes_id_fk"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "app_network_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_network_interactions: {
        Row: {
          agent_id: string
          created_at: string
          description: string | null
          edge_id: string
          id: string
          interaction_date: string
          interaction_type: string
          metadata: Json | null
          notes: string | null
          outcome: string | null
          strength_change: number | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          description?: string | null
          edge_id: string
          id?: string
          interaction_date: string
          interaction_type: string
          metadata?: Json | null
          notes?: string | null
          outcome?: string | null
          strength_change?: number | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          description?: string | null
          edge_id?: string
          id?: string
          interaction_date?: string
          interaction_type?: string
          metadata?: Json | null
          notes?: string | null
          outcome?: string | null
          strength_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "app_network_interactions_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_network_interactions_edge_id_app_network_edges_id_fk"
            columns: ["edge_id"]
            isOneToOne: false
            referencedRelation: "app_network_edges"
            referencedColumns: ["id"]
          },
        ]
      }
      app_network_nodes: {
        Row: {
          agent_id: string
          centrality_score: number | null
          client_id: string | null
          company: string | null
          connections_count: number
          created_at: string
          email: string | null
          id: string
          influence_score: number | null
          is_active: boolean
          location: string | null
          metadata: Json | null
          name: string
          node_type: Database["public"]["Enums"]["app_network_node_type_enum"]
          phone: string | null
          position: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          centrality_score?: number | null
          client_id?: string | null
          company?: string | null
          connections_count?: number
          created_at?: string
          email?: string | null
          id?: string
          influence_score?: number | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          name: string
          node_type: Database["public"]["Enums"]["app_network_node_type_enum"]
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          centrality_score?: number | null
          client_id?: string | null
          company?: string | null
          connections_count?: number
          created_at?: string
          email?: string | null
          id?: string
          influence_score?: number | null
          is_active?: boolean
          location?: string | null
          metadata?: Json | null
          name?: string
          node_type?: Database["public"]["Enums"]["app_network_node_type_enum"]
          phone?: string | null
          position?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_network_nodes_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_network_nodes_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_network_opportunities: {
        Row: {
          agent_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          opportunity_type: string
          outcome: string | null
          potential_value: number | null
          priority: string | null
          source_node_id: string
          status: string | null
          target_node_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          opportunity_type: string
          outcome?: string | null
          potential_value?: number | null
          priority?: string | null
          source_node_id: string
          status?: string | null
          target_node_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          opportunity_type?: string
          outcome?: string | null
          potential_value?: number | null
          priority?: string | null
          source_node_id?: string
          status?: string | null
          target_node_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_network_opportunities_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_network_stats: {
        Row: {
          agent_id: string
          analysis_date: string
          analysis_type: Database["public"]["Enums"]["app_network_analysis_type_enum"]
          average_path_length: number | null
          clustering_coefficient: number | null
          community_structure: Json | null
          created_at: string
          growth_metrics: Json | null
          id: string
          network_density: number | null
          raw_data: Json | null
          recommendations: Json | null
          team_id: string | null
          top_influencers: Json | null
          total_connections: number
          total_nodes: number
        }
        Insert: {
          agent_id: string
          analysis_date?: string
          analysis_type: Database["public"]["Enums"]["app_network_analysis_type_enum"]
          average_path_length?: number | null
          clustering_coefficient?: number | null
          community_structure?: Json | null
          created_at?: string
          growth_metrics?: Json | null
          id?: string
          network_density?: number | null
          raw_data?: Json | null
          recommendations?: Json | null
          team_id?: string | null
          top_influencers?: Json | null
          total_connections?: number
          total_nodes?: number
        }
        Update: {
          agent_id?: string
          analysis_date?: string
          analysis_type?: Database["public"]["Enums"]["app_network_analysis_type_enum"]
          average_path_length?: number | null
          clustering_coefficient?: number | null
          community_structure?: Json | null
          created_at?: string
          growth_metrics?: Json | null
          id?: string
          network_density?: number | null
          raw_data?: Json | null
          recommendations?: Json | null
          team_id?: string | null
          top_influencers?: Json | null
          total_connections?: number
          total_nodes?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_network_stats_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_network_stats_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_history: {
        Row: {
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at: string
          delivered_at: string | null
          id: string
          message: string
          metadata: Json | null
          queue_id: string | null
          read_at: string | null
          recipient: string
          response_data: Json | null
          sent_at: string
          status: Database["public"]["Enums"]["app_notification_status_enum"]
          title: string
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          queue_id?: string | null
          read_at?: string | null
          recipient: string
          response_data?: Json | null
          sent_at: string
          status: Database["public"]["Enums"]["app_notification_status_enum"]
          title: string
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          delivered_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          queue_id?: string | null
          read_at?: string | null
          recipient?: string
          response_data?: Json | null
          sent_at?: string
          status?: Database["public"]["Enums"]["app_notification_status_enum"]
          title?: string
          type?: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_history_queue_id_app_notification_queue_id_fk"
            columns: ["queue_id"]
            isOneToOne: false
            referencedRelation: "app_notification_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_notification_history_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_queue: {
        Row: {
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          max_retries: number
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["app_notification_priority_enum"]
          read_at: string | null
          recipient: string
          retry_count: number
          scheduled_at: string
          sent_at: string | null
          status: Database["public"]["Enums"]["app_notification_status_enum"]
          template_id: string | null
          title: string
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["app_notification_priority_enum"]
          read_at?: string | null
          recipient: string
          retry_count?: number
          scheduled_at: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["app_notification_status_enum"]
          template_id?: string | null
          title: string
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          max_retries?: number
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["app_notification_priority_enum"]
          read_at?: string | null
          recipient?: string
          retry_count?: number
          scheduled_at?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["app_notification_status_enum"]
          template_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["app_notification_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_queue_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_triggered: string | null
          name: string
          team_id: string | null
          trigger_count: number
          trigger_event: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions: Json
          conditions: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          name: string
          team_id?: string | null
          trigger_count?: number
          trigger_event: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          name?: string
          team_id?: string | null
          trigger_count?: number
          trigger_event?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_rules_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_notification_rules_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_settings: {
        Row: {
          birthday_reminders: boolean
          client_milestones: boolean
          created_at: string
          email_notifications: boolean
          follow_up_reminders: boolean
          goal_deadlines: boolean
          id: string
          kakao_notifications: boolean
          meeting_reminders: boolean
          new_referrals: boolean
          push_notifications: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sms_notifications: boolean
          system_alerts: boolean
          team_updates: boolean
          updated_at: string
          user_id: string
          weekend_notifications: boolean
        }
        Insert: {
          birthday_reminders?: boolean
          client_milestones?: boolean
          created_at?: string
          email_notifications?: boolean
          follow_up_reminders?: boolean
          goal_deadlines?: boolean
          id?: string
          kakao_notifications?: boolean
          meeting_reminders?: boolean
          new_referrals?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          system_alerts?: boolean
          team_updates?: boolean
          updated_at?: string
          user_id: string
          weekend_notifications?: boolean
        }
        Update: {
          birthday_reminders?: boolean
          client_milestones?: boolean
          created_at?: string
          email_notifications?: boolean
          follow_up_reminders?: boolean
          goal_deadlines?: boolean
          id?: string
          kakao_notifications?: boolean
          meeting_reminders?: boolean
          new_referrals?: boolean
          push_notifications?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sms_notifications?: boolean
          system_alerts?: boolean
          team_updates?: boolean
          updated_at?: string
          user_id?: string
          weekend_notifications?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_settings_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_subscriptions: {
        Row: {
          channels: Database["public"]["Enums"]["app_notification_channel_enum"][]
          created_at: string
          id: string
          is_active: boolean
          resource_id: string
          resource_type: string
          subscription_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channels: Database["public"]["Enums"]["app_notification_channel_enum"][]
          created_at?: string
          id?: string
          is_active?: boolean
          resource_id: string
          resource_type: string
          subscription_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: Database["public"]["Enums"]["app_notification_channel_enum"][]
          created_at?: string
          id?: string
          is_active?: boolean
          resource_id?: string
          resource_type?: string
          subscription_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_subscriptions_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_notification_templates: {
        Row: {
          body_template: string
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          subject: string | null
          team_id: string | null
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          updated_at: string
          usage_count: number
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          body_template: string
          channel: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          subject?: string | null
          team_id?: string | null
          type: Database["public"]["Enums"]["app_notification_type_enum"]
          updated_at?: string
          usage_count?: number
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          body_template?: string
          channel?: Database["public"]["Enums"]["app_notification_channel_enum"]
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          subject?: string | null
          team_id?: string | null
          type?: Database["public"]["Enums"]["app_notification_type_enum"]
          updated_at?: string
          usage_count?: number
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "app_notification_templates_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_notification_templates_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_opportunity_products: {
        Row: {
          agent_id: string
          client_id: string
          created_at: string
          expected_commission: number | null
          id: string
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          monthly_premium: number | null
          notes: string | null
          product_name: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_id: string
          created_at?: string
          expected_commission?: number | null
          id?: string
          insurance_company: string
          insurance_type: Database["public"]["Enums"]["app_insurance_type_enum"]
          monthly_premium?: number | null
          notes?: string | null
          product_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_id?: string
          created_at?: string
          expected_commission?: number | null
          id?: string
          insurance_company?: string
          insurance_type?: Database["public"]["Enums"]["app_insurance_type_enum"]
          monthly_premium?: number | null
          notes?: string | null
          product_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_opportunity_products_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_opportunity_products_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_analytics: {
        Row: {
          average_time_in_stage: number | null
          clients_entered: number
          clients_exited: number
          clients_remaining: number
          conversion_rate: number | null
          created_at: string
          date: string
          id: string
          stage_id: string
          team_id: string | null
          user_id: string
        }
        Insert: {
          average_time_in_stage?: number | null
          clients_entered?: number
          clients_exited?: number
          clients_remaining?: number
          conversion_rate?: number | null
          created_at?: string
          date: string
          id?: string
          stage_id: string
          team_id?: string | null
          user_id: string
        }
        Update: {
          average_time_in_stage?: number | null
          clients_entered?: number
          clients_exited?: number
          clients_remaining?: number
          conversion_rate?: number | null
          created_at?: string
          date?: string
          id?: string
          stage_id?: string
          team_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_analytics_stage_id_app_pipeline_stages_id_fk"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "app_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_analytics_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_analytics_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_automations: {
        Row: {
          actions: Json
          created_at: string
          description: string | null
          execution_count: number
          id: string
          is_active: boolean
          last_executed: string | null
          name: string
          stage_id: string | null
          team_id: string | null
          trigger: Database["public"]["Enums"]["app_pipeline_automation_trigger_enum"]
          trigger_conditions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          actions: Json
          created_at?: string
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed?: string | null
          name: string
          stage_id?: string | null
          team_id?: string | null
          trigger: Database["public"]["Enums"]["app_pipeline_automation_trigger_enum"]
          trigger_conditions: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed?: string | null
          name?: string
          stage_id?: string | null
          team_id?: string | null
          trigger?: Database["public"]["Enums"]["app_pipeline_automation_trigger_enum"]
          trigger_conditions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_automations_stage_id_app_pipeline_stages_id_fk"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "app_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_automations_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_automations_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean
          name: string
          period: string
          stage_id: string | null
          start_date: string
          target_type: string
          target_value: number
          team_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean
          name: string
          period: string
          stage_id?: string | null
          start_date: string
          target_type: string
          target_value: number
          team_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean
          name?: string
          period?: string
          stage_id?: string | null
          start_date?: string
          target_type?: string
          target_value?: number
          team_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_goals_stage_id_app_pipeline_stages_id_fk"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "app_pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_goals_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_goals_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_stage_history: {
        Row: {
          action_type: Database["public"]["Enums"]["app_pipeline_stage_action_type_enum"]
          changed_by: string
          client_id: string
          created_at: string
          from_stage_id: string | null
          id: string
          metadata: Json | null
          notes: string | null
          reason: string | null
          time_in_previous_stage: number | null
          to_stage_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["app_pipeline_stage_action_type_enum"]
          changed_by: string
          client_id: string
          created_at?: string
          from_stage_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          reason?: string | null
          time_in_previous_stage?: number | null
          to_stage_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["app_pipeline_stage_action_type_enum"]
          changed_by?: string
          client_id?: string
          created_at?: string
          from_stage_id?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          reason?: string | null
          time_in_previous_stage?: number | null
          to_stage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_stage_history_changed_by_app_user_profiles_id_fk"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_stage_history_client_id_app_client_profiles_id_fk"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_client_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_stage_templates: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          is_public: boolean
          name: string
          stages: Json
          team_id: string | null
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          name: string
          stages: Json
          team_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          name?: string
          stages?: Json
          team_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_stage_templates_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_stage_templates_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_stages: {
        Row: {
          agent_id: string | null
          color: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          order: number
          team_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id?: string | null
          color: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          order: number
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string | null
          color?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          order?: number
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_stages_agent_id_app_user_profiles_id_fk"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_stages_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_pipeline_views: {
        Row: {
          column_settings: Json | null
          created_at: string
          description: string | null
          filters: Json | null
          group_by: string | null
          id: string
          is_default: boolean
          is_public: boolean
          last_used: string | null
          name: string
          sort_by: string | null
          sort_order: string | null
          team_id: string | null
          updated_at: string
          usage_count: number
          user_id: string
          view_type: Database["public"]["Enums"]["app_pipeline_view_type_enum"]
          visible_stages: string[] | null
        }
        Insert: {
          column_settings?: Json | null
          created_at?: string
          description?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          last_used?: string | null
          name: string
          sort_by?: string | null
          sort_order?: string | null
          team_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id: string
          view_type?: Database["public"]["Enums"]["app_pipeline_view_type_enum"]
          visible_stages?: string[] | null
        }
        Update: {
          column_settings?: Json | null
          created_at?: string
          description?: string | null
          filters?: Json | null
          group_by?: string | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          last_used?: string | null
          name?: string
          sort_by?: string | null
          sort_order?: string | null
          team_id?: string | null
          updated_at?: string
          usage_count?: number
          user_id?: string
          view_type?: Database["public"]["Enums"]["app_pipeline_view_type_enum"]
          visible_stages?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "app_pipeline_views_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_pipeline_views_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_dashboards: {
        Row: {
          created_at: string
          description: string | null
          filters: Json | null
          id: string
          is_default: boolean
          is_public: boolean
          last_viewed: string | null
          layout: Json
          name: string
          refresh_interval: number | null
          team_id: string | null
          updated_at: string
          user_id: string
          view_count: number
          widgets: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          last_viewed?: string | null
          layout: Json
          name: string
          refresh_interval?: number | null
          team_id?: string | null
          updated_at?: string
          user_id: string
          view_count?: number
          widgets: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          last_viewed?: string | null
          layout?: Json
          name?: string
          refresh_interval?: number | null
          team_id?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number
          widgets?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_report_dashboards_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_dashboards_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_exports: {
        Row: {
          created_at: string
          download_count: number
          expires_at: string | null
          file_path: string
          file_size: number
          format: Database["public"]["Enums"]["app_report_format_enum"]
          id: string
          last_downloaded: string | null
          report_instance_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          download_count?: number
          expires_at?: string | null
          file_path: string
          file_size: number
          format: Database["public"]["Enums"]["app_report_format_enum"]
          id?: string
          last_downloaded?: string | null
          report_instance_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          download_count?: number
          expires_at?: string | null
          file_path?: string
          file_size?: number
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          id?: string
          last_downloaded?: string | null
          report_instance_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_report_exports_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_instances: {
        Row: {
          created_at: string
          data: Json | null
          download_count: number
          error_message: string | null
          expires_at: string | null
          file_path: string | null
          file_size: number | null
          format: Database["public"]["Enums"]["app_report_format_enum"]
          generated_at: string | null
          id: string
          metadata: Json | null
          name: string
          parameters: Json | null
          schedule_id: string | null
          status: Database["public"]["Enums"]["app_report_status_enum"]
          template_id: string | null
          type: Database["public"]["Enums"]["app_report_type_enum"]
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format: Database["public"]["Enums"]["app_report_format_enum"]
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          name: string
          parameters?: Json | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["app_report_status_enum"]
          template_id?: string | null
          type: Database["public"]["Enums"]["app_report_type_enum"]
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          download_count?: number
          error_message?: string | null
          expires_at?: string | null
          file_path?: string | null
          file_size?: number | null
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          parameters?: Json | null
          schedule_id?: string | null
          status?: Database["public"]["Enums"]["app_report_status_enum"]
          template_id?: string | null
          type?: Database["public"]["Enums"]["app_report_type_enum"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_report_instances_schedule_id_app_report_schedules_id_fk"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "app_report_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_instances_template_id_app_report_templates_id_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "app_report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_instances_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_metrics: {
        Row: {
          change_percent: number | null
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          previous_value: number | null
          team_id: string | null
          user_id: string
          value: number
        }
        Insert: {
          change_percent?: number | null
          created_at?: string
          date: string
          id?: string
          metadata?: Json | null
          metric_type: string
          previous_value?: number | null
          team_id?: string | null
          user_id: string
          value: number
        }
        Update: {
          change_percent?: number | null
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          previous_value?: number | null
          team_id?: string | null
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_report_metrics_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_metrics_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_schedules: {
        Row: {
          created_at: string
          description: string | null
          filters: Json | null
          format: Database["public"]["Enums"]["app_report_format_enum"]
          frequency: Database["public"]["Enums"]["app_report_frequency_enum"]
          id: string
          is_active: boolean
          last_run_at: string | null
          name: string
          next_run_at: string | null
          recipients: string[]
          run_count: number
          team_id: string | null
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          frequency: Database["public"]["Enums"]["app_report_frequency_enum"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          recipients: string[]
          run_count?: number
          team_id?: string | null
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json | null
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          frequency?: Database["public"]["Enums"]["app_report_frequency_enum"]
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          recipients?: string[]
          run_count?: number
          team_id?: string | null
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_report_schedules_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_schedules_template_id_app_report_templates_id_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "app_report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_schedules_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_subscriptions: {
        Row: {
          created_at: string
          email: string
          filters: Json | null
          format: Database["public"]["Enums"]["app_report_format_enum"]
          frequency: Database["public"]["Enums"]["app_report_frequency_enum"]
          id: string
          is_active: boolean
          last_sent: string | null
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          filters?: Json | null
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          frequency: Database["public"]["Enums"]["app_report_frequency_enum"]
          id?: string
          is_active?: boolean
          last_sent?: string | null
          template_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          filters?: Json | null
          format?: Database["public"]["Enums"]["app_report_format_enum"]
          frequency?: Database["public"]["Enums"]["app_report_frequency_enum"]
          id?: string
          is_active?: boolean
          last_sent?: string | null
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_report_subscriptions_template_id_app_report_templates_id_fk"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "app_report_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_subscriptions_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_report_templates: {
        Row: {
          category: string | null
          charts: Json | null
          config: Json
          created_at: string
          description: string | null
          filters: Json | null
          id: string
          is_default: boolean
          is_public: boolean
          layout: Json | null
          name: string
          team_id: string | null
          type: Database["public"]["Enums"]["app_report_type_enum"]
          updated_at: string
          usage_count: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          charts?: Json | null
          config: Json
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout?: Json | null
          name: string
          team_id?: string | null
          type: Database["public"]["Enums"]["app_report_type_enum"]
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          charts?: Json | null
          config?: Json
          created_at?: string
          description?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean
          is_public?: boolean
          layout?: Json | null
          name?: string
          team_id?: string | null
          type?: Database["public"]["Enums"]["app_report_type_enum"]
          updated_at?: string
          usage_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_report_templates_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_report_templates_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_backups: {
        Row: {
          backup_data: Json
          backup_name: string
          backup_version: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          backup_data: Json
          backup_name: string
          backup_version?: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          backup_data?: Json
          backup_name?: string
          backup_version?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_backups_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_change_logs: {
        Row: {
          change_reason: string | null
          created_at: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
          setting_category: Database["public"]["Enums"]["app_settings_category"]
          setting_field: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          setting_category: Database["public"]["Enums"]["app_settings_category"]
          setting_field: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          created_at?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
          setting_category?: Database["public"]["Enums"]["app_settings_category"]
          setting_field?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_change_logs_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_integrations: {
        Row: {
          config: Json
          created_at: string
          credentials: Json | null
          id: string
          integration_name: string
          integration_type: Database["public"]["Enums"]["app_settings_integration_type"]
          is_active: boolean
          last_error_message: string | null
          last_sync_at: string | null
          status: Database["public"]["Enums"]["app_settings_integration_status"]
          sync_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_name: string
          integration_type: Database["public"]["Enums"]["app_settings_integration_type"]
          is_active?: boolean
          last_error_message?: string | null
          last_sync_at?: string | null
          status?: Database["public"]["Enums"]["app_settings_integration_status"]
          sync_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string
          credentials?: Json | null
          id?: string
          integration_name?: string
          integration_type?: Database["public"]["Enums"]["app_settings_integration_type"]
          is_active?: boolean
          last_error_message?: string | null
          last_sync_at?: string | null
          status?: Database["public"]["Enums"]["app_settings_integration_status"]
          sync_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_integrations_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_security_logs: {
        Row: {
          action_description: string
          action_type: string
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          location: string | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_description: string
          action_type: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_description?: string
          action_type?: string
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          location?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_security_logs_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_theme_preferences: {
        Row: {
          accent_color: string
          compact_mode: boolean
          created_at: string
          font_family: string
          font_size: string
          id: string
          primary_color: string
          sidebar_collapsed: boolean
          theme_mode: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color?: string
          compact_mode?: boolean
          created_at?: string
          font_family?: string
          font_size?: string
          id?: string
          primary_color?: string
          sidebar_collapsed?: boolean
          theme_mode?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color?: string
          compact_mode?: boolean
          created_at?: string
          font_family?: string
          font_size?: string
          id?: string
          primary_color?: string
          sidebar_collapsed?: boolean
          theme_mode?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_theme_preferences_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings_user_profiles: {
        Row: {
          agent_settings: Json | null
          created_at: string
          dark_mode: boolean
          id: string
          language: string
          notification_settings: Json
          timezone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_settings?: Json | null
          created_at?: string
          dark_mode?: boolean
          id?: string
          language?: string
          notification_settings?: Json
          timezone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_settings?: Json | null
          created_at?: string
          dark_mode?: boolean
          id?: string
          language?: string
          notification_settings?: Json
          timezone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_user_profiles_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["app_team_activity_type_enum"]
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          team_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["app_team_activity_type_enum"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          team_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["app_team_activity_type_enum"]
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          team_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_team_activity_logs_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_activity_logs_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_communication_channels: {
        Row: {
          channel_description: string | null
          channel_name: string
          channel_type: string
          created_at: string
          created_by: string
          id: string
          is_archived: boolean
          is_private: boolean
          last_activity_at: string | null
          member_count: number
          message_count: number
          team_id: string
          updated_at: string
        }
        Insert: {
          channel_description?: string | null
          channel_name: string
          channel_type?: string
          created_at?: string
          created_by: string
          id?: string
          is_archived?: boolean
          is_private?: boolean
          last_activity_at?: string | null
          member_count?: number
          message_count?: number
          team_id: string
          updated_at?: string
        }
        Update: {
          channel_description?: string | null
          channel_name?: string
          channel_type?: string
          created_at?: string
          created_by?: string
          id?: string
          is_archived?: boolean
          is_private?: boolean
          last_activity_at?: string | null
          member_count?: number
          message_count?: number
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_team_communication_channels_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_goals: {
        Row: {
          achieved_at: string | null
          created_at: string
          created_by: string
          current_value: number
          description: string | null
          end_date: string
          goal_type: string
          id: string
          is_achieved: boolean
          is_active: boolean
          start_date: string
          target_metric: string
          target_value: number
          team_id: string
          title: string
          updated_at: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          created_by: string
          current_value?: number
          description?: string | null
          end_date: string
          goal_type: string
          id?: string
          is_achieved?: boolean
          is_active?: boolean
          start_date: string
          target_metric: string
          target_value: number
          team_id: string
          title: string
          updated_at?: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          created_by?: string
          current_value?: number
          description?: string | null
          end_date?: string
          goal_type?: string
          id?: string
          is_achieved?: boolean
          is_active?: boolean
          start_date?: string
          target_metric?: string
          target_value?: number
          team_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_team_goals_created_by_app_user_profiles_id_fk"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_goals_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_members: {
        Row: {
          created_at: string
          id: string
          invited_by: string | null
          joined_at: string
          last_active_at: string | null
          notes: string | null
          role: Database["public"]["Enums"]["app_team_member_role_enum"]
          status: Database["public"]["Enums"]["app_team_member_status_enum"]
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active_at?: string | null
          notes?: string | null
          role?: Database["public"]["Enums"]["app_team_member_role_enum"]
          status?: Database["public"]["Enums"]["app_team_member_status_enum"]
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string | null
          joined_at?: string
          last_active_at?: string | null
          notes?: string | null
          role?: Database["public"]["Enums"]["app_team_member_role_enum"]
          status?: Database["public"]["Enums"]["app_team_member_status_enum"]
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_team_members_invited_by_app_user_profiles_id_fk"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_members_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_members_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_performance_metrics: {
        Row: {
          calls_made: number
          created_at: string
          emails_sent: number
          follow_ups_completed: number
          id: string
          meetings_held: number
          member_id: string
          month: number
          new_clients: number
          referrals_received: number
          team_id: string
          total_contracts: number
          total_premium: number
          updated_at: string
          year: number
        }
        Insert: {
          calls_made?: number
          created_at?: string
          emails_sent?: number
          follow_ups_completed?: number
          id?: string
          meetings_held?: number
          member_id: string
          month: number
          new_clients?: number
          referrals_received?: number
          team_id: string
          total_contracts?: number
          total_premium?: number
          updated_at?: string
          year: number
        }
        Update: {
          calls_made?: number
          created_at?: string
          emails_sent?: number
          follow_ups_completed?: number
          id?: string
          meetings_held?: number
          member_id?: string
          month?: number
          new_clients?: number
          referrals_received?: number
          team_id?: string
          total_contracts?: number
          total_premium?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_team_performance_metrics_member_id_app_user_profiles_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_performance_metrics_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_stats_cache: {
        Row: {
          active_members: number
          id: string
          last_updated: string
          pending_invites: number
          team_id: string
          total_clients: number
          total_members: number
        }
        Insert: {
          active_members?: number
          id?: string
          last_updated?: string
          pending_invites?: number
          team_id: string
          total_clients?: number
          total_members?: number
        }
        Update: {
          active_members?: number
          id?: string
          last_updated?: string
          pending_invites?: number
          team_id?: string
          total_clients?: number
          total_members?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_team_stats_cache_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      app_team_training_records: {
        Row: {
          certificate_number: string | null
          completed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_completed: boolean
          member_id: string
          notes: string | null
          score: number | null
          team_id: string
          trainer_id: string | null
          training_duration: number | null
          training_title: string
          training_type: string
          updated_at: string
        }
        Insert: {
          certificate_number?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_completed?: boolean
          member_id: string
          notes?: string | null
          score?: number | null
          team_id: string
          trainer_id?: string | null
          training_duration?: number | null
          training_title: string
          training_type: string
          updated_at?: string
        }
        Update: {
          certificate_number?: string | null
          completed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_completed?: boolean
          member_id?: string
          notes?: string | null
          score?: number | null
          team_id?: string
          trainer_id?: string | null
          training_duration?: number | null
          training_title?: string
          training_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_team_training_records_member_id_app_user_profiles_id_fk"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_training_records_team_id_app_user_teams_id_fk"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "app_user_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_team_training_records_trainer_id_app_user_profiles_id_fk"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_invitations: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          invitee_email: string | null
          inviter_id: string
          message: string | null
          status: Database["public"]["Enums"]["app_invitation_status_enum"]
          used_at: string | null
          used_by_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invitee_email?: string | null
          inviter_id: string
          message?: string | null
          status?: Database["public"]["Enums"]["app_invitation_status_enum"]
          used_at?: string | null
          used_by_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          invitee_email?: string | null
          inviter_id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["app_invitation_status_enum"]
          used_at?: string | null
          used_by_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_user_invitations_inviter_id_app_user_profiles_id_fk"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_user_invitations_used_by_id_app_user_profiles_id_fk"
            columns: ["used_by_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      app_user_profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string
          google_calendar_token: Json | null
          id: string
          invitations_left: number
          invited_by_id: string | null
          is_active: boolean
          language_updated_at: string | null
          last_login_at: string | null
          lemonsqueezy_customer_id: string | null
          lemonsqueezy_subscription_id: string | null
          phone: string | null
          preferred_language: string | null
          profile_image_url: string | null
          role: Database["public"]["Enums"]["app_user_role_enum"]
          settings: Json | null
          subscription_ends_at: string | null
          subscription_status: Database["public"]["Enums"]["app_subscription_status_enum"]
          team_id: string | null
          theme: Database["public"]["Enums"]["app_theme_enum"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name: string
          google_calendar_token?: Json | null
          id: string
          invitations_left?: number
          invited_by_id?: string | null
          is_active?: boolean
          language_updated_at?: string | null
          last_login_at?: string | null
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_user_role_enum"]
          settings?: Json | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["app_subscription_status_enum"]
          team_id?: string | null
          theme?: Database["public"]["Enums"]["app_theme_enum"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string
          google_calendar_token?: Json | null
          id?: string
          invitations_left?: number
          invited_by_id?: string | null
          is_active?: boolean
          language_updated_at?: string | null
          last_login_at?: string | null
          lemonsqueezy_customer_id?: string | null
          lemonsqueezy_subscription_id?: string | null
          phone?: string | null
          preferred_language?: string | null
          profile_image_url?: string | null
          role?: Database["public"]["Enums"]["app_user_role_enum"]
          settings?: Json | null
          subscription_ends_at?: string | null
          subscription_status?: Database["public"]["Enums"]["app_subscription_status_enum"]
          team_id?: string | null
          theme?: Database["public"]["Enums"]["app_theme_enum"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_user_teams: {
        Row: {
          admin_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_user_teams_admin_id_app_user_profiles_id_fk"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_analytics: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_site_analytics_user_id_app_user_profiles_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_announcements: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_pinned: boolean
          is_published: boolean
          language: Database["public"]["Enums"]["public_language_enum"]
          priority: number
          published_at: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          priority?: number
          published_at?: string | null
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_pinned?: boolean
          is_published?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          priority?: number
          published_at?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_site_announcements_author_id_app_user_profiles_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_contents: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          effective_date: string | null
          expiry_date: string | null
          id: string
          language: Database["public"]["Enums"]["public_language_enum"]
          metadata: Json | null
          status: Database["public"]["Enums"]["public_content_status_enum"]
          title: string
          type: Database["public"]["Enums"]["public_content_type_enum"]
          updated_at: string
          version: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          language?: Database["public"]["Enums"]["public_language_enum"]
          metadata?: Json | null
          status?: Database["public"]["Enums"]["public_content_status_enum"]
          title: string
          type: Database["public"]["Enums"]["public_content_type_enum"]
          updated_at?: string
          version?: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          language?: Database["public"]["Enums"]["public_language_enum"]
          metadata?: Json | null
          status?: Database["public"]["Enums"]["public_content_status_enum"]
          title?: string
          type?: Database["public"]["Enums"]["public_content_type_enum"]
          updated_at?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_site_contents_author_id_app_user_profiles_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_faqs: {
        Row: {
          answer: string
          author_id: string | null
          category: string
          created_at: string
          id: string
          is_published: boolean
          language: Database["public"]["Enums"]["public_language_enum"]
          order: number
          question: string
          updated_at: string
          view_count: number
        }
        Insert: {
          answer: string
          author_id?: string | null
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          order?: number
          question: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          answer?: string
          author_id?: string | null
          category?: string
          created_at?: string
          id?: string
          is_published?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          order?: number
          question?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "public_site_faqs_author_id_app_user_profiles_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          key: string
          type: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          key?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_site_settings_updated_by_app_user_profiles_id_fk"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_testimonials: {
        Row: {
          author_id: string | null
          company: string
          created_at: string
          id: string
          initial: string
          is_published: boolean
          is_verified: boolean
          language: Database["public"]["Enums"]["public_language_enum"]
          name: string
          order: number
          quote: string
          rating: number
          role: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          company: string
          created_at?: string
          id?: string
          initial: string
          is_published?: boolean
          is_verified?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          name: string
          order?: number
          quote: string
          rating?: number
          role: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          company?: string
          created_at?: string
          id?: string
          initial?: string
          is_published?: boolean
          is_verified?: boolean
          language?: Database["public"]["Enums"]["public_language_enum"]
          name?: string
          order?: number
          quote?: string
          rating?: number
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_site_testimonials_author_id_app_user_profiles_id_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "app_user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      public_site_waitlist: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          id: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: {
        Args: { client_id: string }
        Returns: boolean
      }
      is_system_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_team_admin: {
        Args: { target_team_id?: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { target_team_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_calendar_external_source_enum:
        | "local"
        | "google_calendar"
        | "outlook"
        | "apple_calendar"
      app_calendar_meeting_status_enum:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      app_calendar_meeting_type_enum:
        | "first_consultation"
        | "product_explanation"
        | "contract_review"
        | "follow_up"
        | "other"
      app_calendar_recurrence_type_enum:
        | "none"
        | "daily"
        | "weekly"
        | "monthly"
        | "yearly"
      app_calendar_reminder_type_enum:
        | "none"
        | "5_minutes"
        | "15_minutes"
        | "30_minutes"
        | "1_hour"
        | "1_day"
      app_calendar_sync_status_enum:
        | "not_synced"
        | "syncing"
        | "synced"
        | "sync_failed"
        | "sync_conflict"
      app_calendar_view_enum: "month" | "week" | "day" | "agenda"
      app_chart_type_enum:
        | "line"
        | "bar"
        | "pie"
        | "doughnut"
        | "area"
        | "scatter"
        | "funnel"
        | "gauge"
      app_client_contact_method_enum:
        | "phone"
        | "email"
        | "kakao"
        | "sms"
        | "in_person"
        | "video_call"
      app_client_data_access_log_type_enum:
        | "view"
        | "edit"
        | "export"
        | "share"
        | "delete"
      app_client_privacy_level_enum:
        | "public"
        | "restricted"
        | "private"
        | "confidential"
      app_client_source_enum:
        | "referral"
        | "cold_call"
        | "marketing"
        | "website"
        | "social_media"
        | "event"
        | "partner"
        | "other"
      app_client_status_enum:
        | "prospect"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "closed_won"
        | "closed_lost"
        | "dormant"
      app_contract_document_type_enum:
        | "contract"
        | "policy"
        | "application"
        | "identification"
        | "medical_report"
        | "vehicle_registration"
        | "other_document"
      app_contract_status_enum:
        | "draft"
        | "active"
        | "cancelled"
        | "expired"
        | "suspended"
      app_dashboard_activity_type_enum:
        | "client_added"
        | "client_updated"
        | "meeting_scheduled"
        | "meeting_completed"
        | "meeting_cancelled"
        | "referral_received"
        | "referral_converted"
        | "goal_achieved"
        | "stage_changed"
        | "document_uploaded"
        | "insurance_added"
      app_dashboard_goal_period_enum: "monthly" | "quarterly" | "yearly"
      app_dashboard_goal_type_enum:
        | "clients"
        | "meetings"
        | "revenue"
        | "referrals"
        | "conversion_rate"
      app_dashboard_metric_period_enum:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
      app_dashboard_notification_priority_enum:
        | "low"
        | "normal"
        | "high"
        | "urgent"
      app_dashboard_notification_type_enum:
        | "meeting_reminder"
        | "goal_achievement"
        | "goal_deadline"
        | "new_referral"
        | "client_milestone"
        | "team_update"
        | "system_alert"
      app_dashboard_widget_type_enum:
        | "kpi_card"
        | "chart"
        | "table"
        | "calendar"
        | "list"
        | "progress"
        | "notification"
        | "quick_action"
      app_document_type_enum:
        | "policy"
        | "id_card"
        | "vehicle_registration"
        | "vehicle_photo"
        | "dashboard_photo"
        | "license_plate_photo"
        | "blackbox_photo"
        | "insurance_policy_photo"
        | "other"
      app_gender_enum: "male" | "female"
      app_importance_enum: "high" | "medium" | "low"
      app_influencer_activity_type_enum:
        | "new_referral"
        | "referral_converted"
        | "gratitude_sent"
        | "meeting_scheduled"
        | "tier_upgraded"
        | "network_expanded"
        | "relationship_strengthened"
      app_influencer_contact_method_enum:
        | "phone"
        | "email"
        | "kakao"
        | "sms"
        | "in_person"
        | "video_call"
        | "letter"
      app_influencer_data_source_enum:
        | "direct_input"
        | "auto_calculated"
        | "imported"
        | "api_sync"
      app_influencer_gift_type_enum:
        | "flowers"
        | "food_voucher"
        | "coffee_voucher"
        | "traditional_gift"
        | "cash_gift"
        | "experience_voucher"
        | "custom_gift"
        | "none"
      app_influencer_gratitude_status_enum:
        | "planned"
        | "scheduled"
        | "sent"
        | "delivered"
        | "completed"
        | "cancelled"
        | "failed"
      app_influencer_gratitude_type_enum:
        | "thank_you_call"
        | "thank_you_message"
        | "gift_delivery"
        | "meal_invitation"
        | "event_invitation"
        | "holiday_greetings"
        | "birthday_wishes"
        | "custom"
      app_influencer_tier_enum:
        | "bronze"
        | "silver"
        | "gold"
        | "platinum"
        | "diamond"
      app_insurance_type_enum:
        | "life"
        | "health"
        | "auto"
        | "prenatal"
        | "property"
        | "other"
      app_invitation_status_enum: "pending" | "used" | "expired" | "cancelled"
      app_meeting_contact_method_enum:
        | "phone"
        | "video"
        | "in_person"
        | "hybrid"
      app_meeting_expected_outcome_enum:
        | "information_gathering"
        | "needs_analysis"
        | "proposal_presentation"
        | "objection_handling"
        | "contract_discussion"
        | "closing"
        | "relationship_building"
      app_meeting_priority_enum: "low" | "medium" | "high" | "urgent"
      app_meeting_product_interest_enum:
        | "life"
        | "health"
        | "auto"
        | "prenatal"
        | "property"
        | "pension"
        | "investment"
        | "multiple"
      app_meeting_status_enum:
        | "scheduled"
        | "completed"
        | "cancelled"
        | "rescheduled"
      app_meeting_type_enum:
        | "first_consultation"
        | "product_explanation"
        | "contract_review"
        | "follow_up"
        | "other"
      app_network_analysis_type_enum:
        | "centrality"
        | "clustering"
        | "path_analysis"
        | "influence_mapping"
        | "growth_tracking"
      app_network_connection_type_enum:
        | "direct_referral"
        | "family_member"
        | "colleague"
        | "friend"
        | "business_partner"
        | "community_member"
      app_network_node_type_enum:
        | "client"
        | "prospect"
        | "influencer"
        | "partner"
        | "external"
      app_notification_channel_enum:
        | "in_app"
        | "email"
        | "sms"
        | "push"
        | "kakao"
      app_notification_priority_enum: "low" | "normal" | "high" | "urgent"
      app_notification_status_enum:
        | "pending"
        | "sent"
        | "delivered"
        | "read"
        | "failed"
        | "cancelled"
      app_notification_type_enum:
        | "meeting_reminder"
        | "goal_achievement"
        | "goal_deadline"
        | "new_referral"
        | "client_milestone"
        | "team_update"
        | "system_alert"
        | "birthday_reminder"
        | "follow_up_reminder"
        | "contract_expiry"
        | "payment_due"
      app_payment_cycle_enum:
        | "monthly"
        | "quarterly"
        | "semi-annual"
        | "annual"
        | "lump-sum"
      app_pipeline_automation_action_enum:
        | "send_notification"
        | "create_task"
        | "schedule_meeting"
        | "move_to_stage"
        | "assign_to_user"
        | "send_email"
      app_pipeline_automation_trigger_enum:
        | "stage_entry"
        | "stage_exit"
        | "time_in_stage"
        | "client_created"
        | "meeting_scheduled"
        | "document_uploaded"
      app_pipeline_stage_action_type_enum:
        | "moved_to_stage"
        | "stage_created"
        | "stage_updated"
        | "stage_deleted"
        | "bulk_move"
        | "automation_triggered"
      app_pipeline_view_type_enum:
        | "kanban"
        | "list"
        | "table"
        | "timeline"
        | "funnel"
      app_referral_status_enum: "active" | "inactive"
      app_report_format_enum: "pdf" | "excel" | "csv" | "json" | "html"
      app_report_frequency_enum:
        | "daily"
        | "weekly"
        | "monthly"
        | "quarterly"
        | "yearly"
        | "on_demand"
      app_report_status_enum:
        | "pending"
        | "generating"
        | "completed"
        | "failed"
        | "cancelled"
      app_report_type_enum:
        | "performance"
        | "pipeline"
        | "client_analysis"
        | "referral_analysis"
        | "meeting_analysis"
        | "revenue"
        | "conversion"
        | "activity"
        | "custom"
      app_settings_category:
        | "profile"
        | "notifications"
        | "system"
        | "security"
        | "integrations"
      app_settings_integration_status:
        | "active"
        | "inactive"
        | "error"
        | "pending"
      app_settings_integration_type:
        | "kakao_talk"
        | "google_calendar"
        | "email"
        | "sms"
      app_settings_notification_channel: "email" | "sms" | "push" | "kakao"
      app_subscription_status_enum:
        | "trial"
        | "active"
        | "past_due"
        | "cancelled"
        | "expired"
      app_team_activity_type_enum:
        | "member_joined"
        | "member_left"
        | "member_promoted"
        | "member_demoted"
        | "goal_created"
        | "goal_achieved"
        | "meeting_scheduled"
        | "performance_milestone"
      app_team_member_role_enum: "member" | "manager" | "admin"
      app_team_member_status_enum: "active" | "inactive" | "pending"
      app_theme_enum: "light" | "dark"
      app_user_role_enum: "agent" | "team_admin" | "system_admin"
      invitation_source:
        | "direct_link"
        | "email"
        | "sms"
        | "kakao_talk"
        | "qr_code"
        | "referral_bonus"
      invitation_type: "standard" | "premium" | "team_admin" | "beta_tester"
      public_content_status_enum: "draft" | "published" | "archived"
      public_content_type_enum:
        | "terms_of_service"
        | "privacy_policy"
        | "faq"
        | "announcement"
        | "help_article"
      public_language_enum: "ko" | "en" | "ja" | "zh"
      usage_action: "viewed" | "clicked" | "registered" | "completed"
      waitlist_status: "waiting" | "invited" | "registered" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_calendar_external_source_enum: [
        "local",
        "google_calendar",
        "outlook",
        "apple_calendar",
      ],
      app_calendar_meeting_status_enum: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      app_calendar_meeting_type_enum: [
        "first_consultation",
        "product_explanation",
        "contract_review",
        "follow_up",
        "other",
      ],
      app_calendar_recurrence_type_enum: [
        "none",
        "daily",
        "weekly",
        "monthly",
        "yearly",
      ],
      app_calendar_reminder_type_enum: [
        "none",
        "5_minutes",
        "15_minutes",
        "30_minutes",
        "1_hour",
        "1_day",
      ],
      app_calendar_sync_status_enum: [
        "not_synced",
        "syncing",
        "synced",
        "sync_failed",
        "sync_conflict",
      ],
      app_calendar_view_enum: ["month", "week", "day", "agenda"],
      app_chart_type_enum: [
        "line",
        "bar",
        "pie",
        "doughnut",
        "area",
        "scatter",
        "funnel",
        "gauge",
      ],
      app_client_contact_method_enum: [
        "phone",
        "email",
        "kakao",
        "sms",
        "in_person",
        "video_call",
      ],
      app_client_data_access_log_type_enum: [
        "view",
        "edit",
        "export",
        "share",
        "delete",
      ],
      app_client_privacy_level_enum: [
        "public",
        "restricted",
        "private",
        "confidential",
      ],
      app_client_source_enum: [
        "referral",
        "cold_call",
        "marketing",
        "website",
        "social_media",
        "event",
        "partner",
        "other",
      ],
      app_client_status_enum: [
        "prospect",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "closed_won",
        "closed_lost",
        "dormant",
      ],
      app_contract_document_type_enum: [
        "contract",
        "policy",
        "application",
        "identification",
        "medical_report",
        "vehicle_registration",
        "other_document",
      ],
      app_contract_status_enum: [
        "draft",
        "active",
        "cancelled",
        "expired",
        "suspended",
      ],
      app_dashboard_activity_type_enum: [
        "client_added",
        "client_updated",
        "meeting_scheduled",
        "meeting_completed",
        "meeting_cancelled",
        "referral_received",
        "referral_converted",
        "goal_achieved",
        "stage_changed",
        "document_uploaded",
        "insurance_added",
      ],
      app_dashboard_goal_period_enum: ["monthly", "quarterly", "yearly"],
      app_dashboard_goal_type_enum: [
        "clients",
        "meetings",
        "revenue",
        "referrals",
        "conversion_rate",
      ],
      app_dashboard_metric_period_enum: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
      ],
      app_dashboard_notification_priority_enum: [
        "low",
        "normal",
        "high",
        "urgent",
      ],
      app_dashboard_notification_type_enum: [
        "meeting_reminder",
        "goal_achievement",
        "goal_deadline",
        "new_referral",
        "client_milestone",
        "team_update",
        "system_alert",
      ],
      app_dashboard_widget_type_enum: [
        "kpi_card",
        "chart",
        "table",
        "calendar",
        "list",
        "progress",
        "notification",
        "quick_action",
      ],
      app_document_type_enum: [
        "policy",
        "id_card",
        "vehicle_registration",
        "vehicle_photo",
        "dashboard_photo",
        "license_plate_photo",
        "blackbox_photo",
        "insurance_policy_photo",
        "other",
      ],
      app_gender_enum: ["male", "female"],
      app_importance_enum: ["high", "medium", "low"],
      app_influencer_activity_type_enum: [
        "new_referral",
        "referral_converted",
        "gratitude_sent",
        "meeting_scheduled",
        "tier_upgraded",
        "network_expanded",
        "relationship_strengthened",
      ],
      app_influencer_contact_method_enum: [
        "phone",
        "email",
        "kakao",
        "sms",
        "in_person",
        "video_call",
        "letter",
      ],
      app_influencer_data_source_enum: [
        "direct_input",
        "auto_calculated",
        "imported",
        "api_sync",
      ],
      app_influencer_gift_type_enum: [
        "flowers",
        "food_voucher",
        "coffee_voucher",
        "traditional_gift",
        "cash_gift",
        "experience_voucher",
        "custom_gift",
        "none",
      ],
      app_influencer_gratitude_status_enum: [
        "planned",
        "scheduled",
        "sent",
        "delivered",
        "completed",
        "cancelled",
        "failed",
      ],
      app_influencer_gratitude_type_enum: [
        "thank_you_call",
        "thank_you_message",
        "gift_delivery",
        "meal_invitation",
        "event_invitation",
        "holiday_greetings",
        "birthday_wishes",
        "custom",
      ],
      app_influencer_tier_enum: [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
      ],
      app_insurance_type_enum: [
        "life",
        "health",
        "auto",
        "prenatal",
        "property",
        "other",
      ],
      app_invitation_status_enum: ["pending", "used", "expired", "cancelled"],
      app_meeting_contact_method_enum: [
        "phone",
        "video",
        "in_person",
        "hybrid",
      ],
      app_meeting_expected_outcome_enum: [
        "information_gathering",
        "needs_analysis",
        "proposal_presentation",
        "objection_handling",
        "contract_discussion",
        "closing",
        "relationship_building",
      ],
      app_meeting_priority_enum: ["low", "medium", "high", "urgent"],
      app_meeting_product_interest_enum: [
        "life",
        "health",
        "auto",
        "prenatal",
        "property",
        "pension",
        "investment",
        "multiple",
      ],
      app_meeting_status_enum: [
        "scheduled",
        "completed",
        "cancelled",
        "rescheduled",
      ],
      app_meeting_type_enum: [
        "first_consultation",
        "product_explanation",
        "contract_review",
        "follow_up",
        "other",
      ],
      app_network_analysis_type_enum: [
        "centrality",
        "clustering",
        "path_analysis",
        "influence_mapping",
        "growth_tracking",
      ],
      app_network_connection_type_enum: [
        "direct_referral",
        "family_member",
        "colleague",
        "friend",
        "business_partner",
        "community_member",
      ],
      app_network_node_type_enum: [
        "client",
        "prospect",
        "influencer",
        "partner",
        "external",
      ],
      app_notification_channel_enum: [
        "in_app",
        "email",
        "sms",
        "push",
        "kakao",
      ],
      app_notification_priority_enum: ["low", "normal", "high", "urgent"],
      app_notification_status_enum: [
        "pending",
        "sent",
        "delivered",
        "read",
        "failed",
        "cancelled",
      ],
      app_notification_type_enum: [
        "meeting_reminder",
        "goal_achievement",
        "goal_deadline",
        "new_referral",
        "client_milestone",
        "team_update",
        "system_alert",
        "birthday_reminder",
        "follow_up_reminder",
        "contract_expiry",
        "payment_due",
      ],
      app_payment_cycle_enum: [
        "monthly",
        "quarterly",
        "semi-annual",
        "annual",
        "lump-sum",
      ],
      app_pipeline_automation_action_enum: [
        "send_notification",
        "create_task",
        "schedule_meeting",
        "move_to_stage",
        "assign_to_user",
        "send_email",
      ],
      app_pipeline_automation_trigger_enum: [
        "stage_entry",
        "stage_exit",
        "time_in_stage",
        "client_created",
        "meeting_scheduled",
        "document_uploaded",
      ],
      app_pipeline_stage_action_type_enum: [
        "moved_to_stage",
        "stage_created",
        "stage_updated",
        "stage_deleted",
        "bulk_move",
        "automation_triggered",
      ],
      app_pipeline_view_type_enum: [
        "kanban",
        "list",
        "table",
        "timeline",
        "funnel",
      ],
      app_referral_status_enum: ["active", "inactive"],
      app_report_format_enum: ["pdf", "excel", "csv", "json", "html"],
      app_report_frequency_enum: [
        "daily",
        "weekly",
        "monthly",
        "quarterly",
        "yearly",
        "on_demand",
      ],
      app_report_status_enum: [
        "pending",
        "generating",
        "completed",
        "failed",
        "cancelled",
      ],
      app_report_type_enum: [
        "performance",
        "pipeline",
        "client_analysis",
        "referral_analysis",
        "meeting_analysis",
        "revenue",
        "conversion",
        "activity",
        "custom",
      ],
      app_settings_category: [
        "profile",
        "notifications",
        "system",
        "security",
        "integrations",
      ],
      app_settings_integration_status: [
        "active",
        "inactive",
        "error",
        "pending",
      ],
      app_settings_integration_type: [
        "kakao_talk",
        "google_calendar",
        "email",
        "sms",
      ],
      app_settings_notification_channel: ["email", "sms", "push", "kakao"],
      app_subscription_status_enum: [
        "trial",
        "active",
        "past_due",
        "cancelled",
        "expired",
      ],
      app_team_activity_type_enum: [
        "member_joined",
        "member_left",
        "member_promoted",
        "member_demoted",
        "goal_created",
        "goal_achieved",
        "meeting_scheduled",
        "performance_milestone",
      ],
      app_team_member_role_enum: ["member", "manager", "admin"],
      app_team_member_status_enum: ["active", "inactive", "pending"],
      app_theme_enum: ["light", "dark"],
      app_user_role_enum: ["agent", "team_admin", "system_admin"],
      invitation_source: [
        "direct_link",
        "email",
        "sms",
        "kakao_talk",
        "qr_code",
        "referral_bonus",
      ],
      invitation_type: ["standard", "premium", "team_admin", "beta_tester"],
      public_content_status_enum: ["draft", "published", "archived"],
      public_content_type_enum: [
        "terms_of_service",
        "privacy_policy",
        "faq",
        "announcement",
        "help_article",
      ],
      public_language_enum: ["ko", "en", "ja", "zh"],
      usage_action: ["viewed", "clicked", "registered", "completed"],
      waitlist_status: ["waiting", "invited", "registered", "rejected"],
    },
  },
} as const
