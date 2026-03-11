export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string;
          owner_user_id: string | null;
          legal_name: string;
          display_name: string;
          default_currency_code: 'CAD' | 'USD';
          time_zone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_user_id?: string | null;
          legal_name: string;
          display_name: string;
          default_currency_code?: 'CAD' | 'USD';
          time_zone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_user_id?: string | null;
          legal_name?: string;
          display_name?: string;
          default_currency_code?: 'CAD' | 'USD';
          time_zone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'businesses_owner_user_id_fkey';
            columns: ['owner_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      customers: {
        Row: {
          id: string;
          business_id: string;
          display_name: string;
          email: string | null;
          phone: string | null;
          address_line_1: string | null;
          address_line_2: string | null;
          city: string | null;
          region: string | null;
          postal_code: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          display_name: string;
          email?: string | null;
          phone?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          display_name?: string;
          email?: string | null;
          phone?: string | null;
          address_line_1?: string | null;
          address_line_2?: string | null;
          city?: string | null;
          region?: string | null;
          postal_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      invoice_line_items: {
        Row: {
          id: string;
          invoice_id: string;
          business_id: string;
          line_type: Database['public']['Enums']['invoice_line_item_type'];
          description: string;
          quantity: string;
          unit_amount_cents: number;
          total_amount_cents: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          business_id: string;
          line_type: Database['public']['Enums']['invoice_line_item_type'];
          description: string;
          quantity?: string;
          unit_amount_cents: number;
          total_amount_cents: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          business_id?: string;
          line_type?: Database['public']['Enums']['invoice_line_item_type'];
          description?: string;
          quantity?: string;
          unit_amount_cents?: number;
          total_amount_cents?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoice_line_items_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoice_line_items_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      invoices: {
        Row: {
          id: string;
          job_id: string;
          business_id: string;
          customer_id: string;
          invoice_number: string;
          payment_status: Database['public']['Enums']['invoice_payment_status'];
          subtotal_cents: number;
          tax_cents: number;
          total_cents: number;
          currency_code: 'CAD' | 'USD';
          payment_link_url: string | null;
          pdf_storage_bucket: string | null;
          pdf_storage_path: string | null;
          sent_at: string | null;
          paid_at: string | null;
          due_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          business_id: string;
          customer_id: string;
          invoice_number: string;
          payment_status?: Database['public']['Enums']['invoice_payment_status'];
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          currency_code?: 'CAD' | 'USD';
          payment_link_url?: string | null;
          pdf_storage_bucket?: string | null;
          pdf_storage_path?: string | null;
          sent_at?: string | null;
          paid_at?: string | null;
          due_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          business_id?: string;
          customer_id?: string;
          invoice_number?: string;
          payment_status?: Database['public']['Enums']['invoice_payment_status'];
          subtotal_cents?: number;
          tax_cents?: number;
          total_cents?: number;
          currency_code?: 'CAD' | 'USD';
          payment_link_url?: string | null;
          pdf_storage_bucket?: string | null;
          pdf_storage_path?: string | null;
          sent_at?: string | null;
          paid_at?: string | null;
          due_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'invoices_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'invoices_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: true;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      job_photos: {
        Row: {
          id: string;
          job_id: string;
          business_id: string;
          category: Database['public']['Enums']['photo_category'];
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          sort_order: number;
          captured_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          business_id: string;
          category: Database['public']['Enums']['photo_category'];
          storage_bucket: string;
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          sort_order?: number;
          captured_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          business_id?: string;
          category?: Database['public']['Enums']['photo_category'];
          storage_bucket?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string | null;
          sort_order?: number;
          captured_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_photos_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_photos_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: false;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          business_id: string;
          customer_id: string;
          created_by_user_id: string;
          title: string;
          site_address_line_1: string | null;
          site_address_line_2: string | null;
          site_city: string | null;
          site_region: string | null;
          site_postal_code: string | null;
          status: Database['public']['Enums']['job_status'];
          scheduled_for: string | null;
          completed_at: string | null;
          work_summary_draft: string | null;
          work_summary_final: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          customer_id: string;
          created_by_user_id: string;
          title: string;
          site_address_line_1?: string | null;
          site_address_line_2?: string | null;
          site_city?: string | null;
          site_region?: string | null;
          site_postal_code?: string | null;
          status?: Database['public']['Enums']['job_status'];
          scheduled_for?: string | null;
          completed_at?: string | null;
          work_summary_draft?: string | null;
          work_summary_final?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          customer_id?: string;
          created_by_user_id?: string;
          title?: string;
          site_address_line_1?: string | null;
          site_address_line_2?: string | null;
          site_city?: string | null;
          site_region?: string | null;
          site_postal_code?: string | null;
          status?: Database['public']['Enums']['job_status'];
          scheduled_for?: string | null;
          completed_at?: string | null;
          work_summary_draft?: string | null;
          work_summary_final?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'jobs_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_created_by_user_id_fkey';
            columns: ['created_by_user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'jobs_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          business_id: string;
          invoice_id: string;
          customer_id: string;
          type: Database['public']['Enums']['message_type'];
          delivery_status: Database['public']['Enums']['message_delivery_status'];
          recipient: string;
          subject: string | null;
          body: string | null;
          provider_message_id: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          invoice_id: string;
          customer_id: string;
          type: Database['public']['Enums']['message_type'];
          delivery_status?: Database['public']['Enums']['message_delivery_status'];
          recipient: string;
          subject?: string | null;
          body?: string | null;
          provider_message_id?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          invoice_id?: string;
          customer_id?: string;
          type?: Database['public']['Enums']['message_type'];
          delivery_status?: Database['public']['Enums']['message_delivery_status'];
          recipient?: string;
          subject?: string | null;
          body?: string | null;
          provider_message_id?: string | null;
          sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_customer_id_fkey';
            columns: ['customer_id'];
            isOneToOne: false;
            referencedRelation: 'customers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_invoice_id_fkey';
            columns: ['invoice_id'];
            isOneToOne: false;
            referencedRelation: 'invoices';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          business_id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          auth_user_id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          auth_user_id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
        ];
      };
      voice_notes: {
        Row: {
          id: string;
          job_id: string;
          business_id: string;
          storage_bucket: string;
          storage_path: string;
          duration_seconds: number | null;
          transcript_draft: string | null;
          transcript_final: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          business_id: string;
          storage_bucket: string;
          storage_path: string;
          duration_seconds?: number | null;
          transcript_draft?: string | null;
          transcript_final?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          business_id?: string;
          storage_bucket?: string;
          storage_path?: string;
          duration_seconds?: number | null;
          transcript_draft?: string | null;
          transcript_final?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'voice_notes_business_id_fkey';
            columns: ['business_id'];
            isOneToOne: false;
            referencedRelation: 'businesses';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'voice_notes_job_id_fkey';
            columns: ['job_id'];
            isOneToOne: true;
            referencedRelation: 'jobs';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      job_status: 'draft' | 'in_progress' | 'proof_captured' | 'invoice_ready' | 'invoice_sent' | 'payment_requested' | 'paid';
      photo_category: 'before' | 'after';
      invoice_payment_status: 'draft' | 'sent' | 'payment_requested' | 'paid' | 'overdue';
      invoice_line_item_type: 'labor' | 'part';
      message_type: 'invoice_email' | 'payment_request_email' | 'payment_request_sms';
      message_delivery_status: 'queued' | 'sent' | 'delivered' | 'failed';
    };
    CompositeTypes: Record<string, never>;
  };
};
