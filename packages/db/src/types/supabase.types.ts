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
      _prisma_migrations: {
        Row: {
          applied_steps_count: number
          checksum: string
          finished_at: string | null
          id: string
          logs: string | null
          migration_name: string
          rolled_back_at: string | null
          started_at: string
        }
        Insert: {
          applied_steps_count?: number
          checksum: string
          finished_at?: string | null
          id: string
          logs?: string | null
          migration_name: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Update: {
          applied_steps_count?: number
          checksum?: string
          finished_at?: string | null
          id?: string
          logs?: string | null
          migration_name?: string
          rolled_back_at?: string | null
          started_at?: string
        }
        Relationships: []
      }
      account: {
        Row: {
          accessToken: string | null
          accessTokenExpiresAt: string | null
          accountId: string
          createdAt: string
          id: string
          idToken: string | null
          password: string | null
          providerId: string
          refreshToken: string | null
          refreshTokenExpiresAt: string | null
          scope: string | null
          updatedAt: string
          userId: string
        }
        Insert: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId: string
          createdAt: string
          id: string
          idToken?: string | null
          password?: string | null
          providerId: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt: string
          userId: string
        }
        Update: {
          accessToken?: string | null
          accessTokenExpiresAt?: string | null
          accountId?: string
          createdAt?: string
          id?: string
          idToken?: string | null
          password?: string | null
          providerId?: string
          refreshToken?: string | null
          refreshTokenExpiresAt?: string | null
          scope?: string | null
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      connection: {
        Row: {
          clientRedirectUrl: string | null
          config: Json | null
          createdAt: string
          id: string
          name: string
          namespaceId: string
          status: Database["public"]["Enums"]["ConnectionStatus"]
          statusDetails: string | null
          type: Database["public"]["Enums"]["ConnectionType"]
          updatedAt: string
        }
        Insert: {
          clientRedirectUrl?: string | null
          config?: Json | null
          createdAt?: string
          id: string
          name: string
          namespaceId: string
          status?: Database["public"]["Enums"]["ConnectionStatus"]
          statusDetails?: string | null
          type: Database["public"]["Enums"]["ConnectionType"]
          updatedAt: string
        }
        Update: {
          clientRedirectUrl?: string | null
          config?: Json | null
          createdAt?: string
          id?: string
          name?: string
          namespaceId?: string
          status?: Database["public"]["Enums"]["ConnectionStatus"]
          statusDetails?: string | null
          type?: Database["public"]["Enums"]["ConnectionType"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "connection_namespaceId_fkey"
            columns: ["namespaceId"]
            isOneToOne: false
            referencedRelation: "namespace"
            referencedColumns: ["id"]
          },
        ]
      }
      ingest_job: {
        Row: {
          completedAt: string | null
          config: Json | null
          createdAt: string
          error: string | null
          failedAt: string | null
          id: string
          namespaceId: string
          payload: Json
          preProcessingAt: string | null
          processingAt: string | null
          queuedAt: string | null
          status: Database["public"]["Enums"]["IngestJobStatus"]
          updatedAt: string
        }
        Insert: {
          completedAt?: string | null
          config?: Json | null
          createdAt?: string
          error?: string | null
          failedAt?: string | null
          id: string
          namespaceId: string
          payload: Json
          preProcessingAt?: string | null
          processingAt?: string | null
          queuedAt?: string | null
          status?: Database["public"]["Enums"]["IngestJobStatus"]
          updatedAt: string
        }
        Update: {
          completedAt?: string | null
          config?: Json | null
          createdAt?: string
          error?: string | null
          failedAt?: string | null
          id?: string
          namespaceId?: string
          payload?: Json
          preProcessingAt?: string | null
          processingAt?: string | null
          queuedAt?: string | null
          status?: Database["public"]["Enums"]["IngestJobStatus"]
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "ingest_job_namespaceId_fkey"
            columns: ["namespaceId"]
            isOneToOne: false
            referencedRelation: "namespace"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation: {
        Row: {
          email: string
          expiresAt: string
          id: string
          inviterId: string
          organizationId: string
          role: string | null
          status: string
        }
        Insert: {
          email: string
          expiresAt: string
          id: string
          inviterId: string
          organizationId: string
          role?: string | null
          status: string
        }
        Update: {
          email?: string
          expiresAt?: string
          id?: string
          inviterId?: string
          organizationId?: string
          role?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_inviterId_fkey"
            columns: ["inviterId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      member: {
        Row: {
          createdAt: string
          id: string
          organizationId: string
          role: string
          userId: string
        }
        Insert: {
          createdAt: string
          id: string
          organizationId: string
          role: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          organizationId?: string
          role?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      namespace: {
        Row: {
          createdAt: string
          embeddingConfig: Json | null
          fileStoreConfig: Json | null
          id: string
          name: string
          organizationId: string
          slug: string
          updatedAt: string
          vectorStoreConfig: Json | null
        }
        Insert: {
          createdAt?: string
          embeddingConfig?: Json | null
          fileStoreConfig?: Json | null
          id: string
          name: string
          organizationId: string
          slug: string
          updatedAt: string
          vectorStoreConfig?: Json | null
        }
        Update: {
          createdAt?: string
          embeddingConfig?: Json | null
          fileStoreConfig?: Json | null
          id?: string
          name?: string
          organizationId?: string
          slug?: string
          updatedAt?: string
          vectorStoreConfig?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "namespace_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      organization: {
        Row: {
          createdAt: string
          id: string
          logo: string | null
          metadata: string | null
          name: string
          slug: string | null
        }
        Insert: {
          createdAt: string
          id: string
          logo?: string | null
          metadata?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          createdAt?: string
          id?: string
          logo?: string | null
          metadata?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      OrganizationApiKey: {
        Row: {
          createdAt: string
          id: string
          key: string
          label: string
          organizationId: string
          scope: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          key: string
          label: string
          organizationId: string
          scope: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          key?: string
          label?: string
          organizationId?: string
          scope?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "OrganizationApiKey_organizationId_fkey"
            columns: ["organizationId"]
            isOneToOne: false
            referencedRelation: "organization"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          activeOrganizationId: string | null
          createdAt: string
          expiresAt: string
          id: string
          ipAddress: string | null
          token: string
          updatedAt: string
          userAgent: string | null
          userId: string
        }
        Insert: {
          activeOrganizationId?: string | null
          createdAt: string
          expiresAt: string
          id: string
          ipAddress?: string | null
          token: string
          updatedAt: string
          userAgent?: string | null
          userId: string
        }
        Update: {
          activeOrganizationId?: string | null
          createdAt?: string
          expiresAt?: string
          id?: string
          ipAddress?: string | null
          token?: string
          updatedAt?: string
          userAgent?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      user: {
        Row: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image: string | null
          name: string
          updatedAt: string
        }
        Insert: {
          createdAt: string
          email: string
          emailVerified: boolean
          id: string
          image?: string | null
          name: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          email?: string
          emailVerified?: boolean
          id?: string
          image?: string | null
          name?: string
          updatedAt?: string
        }
        Relationships: []
      }
      verification: {
        Row: {
          createdAt: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt: string | null
          value: string
        }
        Insert: {
          createdAt?: string | null
          expiresAt: string
          id: string
          identifier: string
          updatedAt?: string | null
          value: string
        }
        Update: {
          createdAt?: string | null
          expiresAt?: string
          id?: string
          identifier?: string
          updatedAt?: string | null
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ConnectionStatus: "PENDING" | "CONNECTED" | "FAILED" | "REVOKED"
      ConnectionType: "NOTION" | "GOOGLE_DRIVE" | "DROPBOX" | "ONE_DRIVE"
      IngestJobStatus:
        | "QUEUED"
        | "PRE_PROCESSING"
        | "PROCESSING"
        | "COMPLETED"
        | "FAILED"
        | "CANCELLED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

