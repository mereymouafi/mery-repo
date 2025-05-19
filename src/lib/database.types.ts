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
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      colors: {
        Row: {
          id: string
          name: string
          hex: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          hex?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          hex?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone_number: string | null
          subject: string | null
          message: string
          created_at: string | null
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone_number?: string | null
          subject?: string | null
          message: string
          created_at?: string | null
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone_number?: string | null
          subject?: string | null
          message?: string
          created_at?: string | null
        }
      }
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
          created_at?: string | null
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
          created_at?: string | null
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
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category_id: string | null
          image: string
          images: string[] | null
          is_new: boolean | null
          is_best_seller: boolean | null
          dimensions: string | null
          material: string
          made_in: string
          sizes: string[] | null
          created_at: string | null
          updated_at: string | null
          brand: string | null
          color: string | null
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category_id?: string | null
          image: string
          images?: string[] | null
          is_new?: boolean | null
          is_best_seller?: boolean | null
          dimensions?: string | null
          material: string
          made_in: string
          sizes?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          brand?: string | null
          color?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category_id?: string | null
          image?: string
          images?: string[] | null
          is_new?: boolean | null
          is_best_seller?: boolean | null
          dimensions?: string | null
          material?: string
          made_in?: string
          sizes?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          brand?: string | null
          color?: string | null
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
