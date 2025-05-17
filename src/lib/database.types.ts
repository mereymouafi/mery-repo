export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          customer_name: string
          phone: string
          address: string
          total_amount: number
          payment_method: string
          payment_status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          customer_name: string
          phone: string
          address: string
          total_amount: number
          payment_method?: string
          payment_status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          customer_name?: string
          phone?: string
          address?: string
          total_amount?: number
          payment_method?: string
          payment_status?: string
          created_at?: string
          updated_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: number | null
          name: string
          price: number
          quantity: number
          image: string | null
          size: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: number | null
          name: string
          price: number
          quantity: number
          image?: string | null
          size?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: number | null
          name?: string
          price?: number
          quantity?: number
          image?: string | null
          size?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
