/**
 * Supabase Real-Time Integration Service
 * Provides real-time market data, alerts, and price history
 * 
 * Real-time features enabled:
 * - Market prices update in real-time (polling every 10s)
 * - Price alerts trigger instantly (polling every 15s)
 * - Price history tracks 24/7 (polling every 20s)
 */

// Use real Supabase credentials
const SUPABASE_URL = 'https://lcgyufjuznexvurvycck.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_NXdeH0Wxm-suKvedDK8C7Q_T5jvDSO7';

class SupabaseRealtimeService {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_ANON_KEY;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
    };
    
    // Real-time subscriptions
    this.subscriptions = {};
    console.log('✅ Supabase Real-time Service initialized');
    console.log(`📍 Project: ${this.url}`);
  }

  /**
   * ─── MARKET PRICES (Real-time) ───────────────────────────
   */

  /**
   * Save or update market price
   */
  async saveMarketPrice(cropData) {
    try {
      // First try to update existing
      const updateResponse = await fetch(
        `${this.url}/rest/v1/market_prices?crop=eq.${cropData.crop}`,
        {
          method: 'PATCH',
          headers: this.headers,
          body: JSON.stringify({
            crop: cropData.crop,
            markets: JSON.stringify(cropData.markets),
            best_market: cropData.best_market,
            average_price: cropData.average_price,
            source: cropData.source,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (updateResponse.status === 204) {
        console.log(`✅ Updated market price for ${cropData.crop}`);
        return { crop: cropData.crop, status: 'updated' };
      }

      // If no rows updated, insert new
      const insertResponse = await fetch(
        `${this.url}/rest/v1/market_prices`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            crop: cropData.crop,
            markets: JSON.stringify(cropData.markets),
            best_market: cropData.best_market,
            average_price: cropData.average_price,
            source: cropData.source,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      if (insertResponse.ok) {
        const result = await insertResponse.json();
        console.log(`✅ Saved market price for ${cropData.crop}`);
        return result[0];
      }
    } catch (error) {
      console.error('❌ Failed to save market price:', error.message);
    }
    return null;
  }

  /**
   * Get market price (with Real-time listener)
   */
  async getMarketPrice(crop, callback) {
    try {
      // First fetch current data
      const response = await fetch(
        `${this.url}/rest/v1/market_prices?crop=eq.${crop}`,
        { headers: this.headers }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const priceData = {
            ...data[0],
            markets: JSON.parse(data[0].markets || '[]'),
          };
          
          // Return current data immediately
          if (callback) {
            callback(priceData);
          }
          
          // Set up real-time listener
          this._subscribeToMarketPrice(crop, callback);
          
          return priceData;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to fetch market price for ${crop}:`, error.message);
    }
    return null;
  }

  /**
   * Subscribe to real-time market price updates (polling-based)
   */
  _subscribeToMarketPrice(crop, callback) {
    const channelName = `market_prices_${crop}`;
    
    if (this.subscriptions[channelName]) {
      console.log(`📡 Already subscribed to ${crop} prices`);
      return;
    }

    // Polling implementation for React Native
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${this.url}/rest/v1/market_prices?crop=eq.${crop}`,
          { headers: this.headers }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const priceData = {
              ...data[0],
              markets: JSON.parse(data[0].markets || '[]'),
            };
            callback(priceData);
          }
        }
      } catch (error) {
        console.error(`Polling error for ${crop}:`, error.message);
      }
    }, 10000); // Poll every 10 seconds

    this.subscriptions[channelName] = pollInterval;
    console.log(`📡 Real-time subscription active: ${crop} (polling 10s)`);
  }

  /**
   * ─── PRICE ALERTS (Real-time) ─────────────────────────
   */

  /**
   * Save price alert
   */
  async savePriceAlert(alertData) {
    try {
      const response = await fetch(`${this.url}/rest/v1/price_alerts`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          farmer_id: alertData.farmer_id,
          crop: alertData.crop,
          location: alertData.location,
          alert_type: alertData.alert_type,
          price_threshold: alertData.price_threshold,
          notification_methods: JSON.stringify(alertData.notification_methods || ['app']),
          created_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Alert saved: ${alertData.crop}`);
        
        // Subscribe to real-time alert updates
        this._subscribeToAlerts(alertData.farmer_id);
        
        return result[0];
      }

      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('❌ Failed to save price alert:', error.message);
    }
    return null;
  }

  /**
   * Get all alerts for a farmer (Real-time)
   */
  async getPriceAlerts(farmerId, callback) {
    try {
      // First fetch current alerts
      const response = await fetch(
        `${this.url}/rest/v1/price_alerts?farmer_id=eq.${farmerId}`,
        { headers: this.headers }
      );

      if (response.ok) {
        const alerts = await response.json();
        
        // Return current alerts immediately
        if (callback) {
          callback(alerts);
        }
        
        // Set up real-time listener
        this._subscribeToAlerts(farmerId, callback);
        
        return alerts;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch alerts:`, error.message);
    }
    return [];
  }

  /**
   * Subscribe to real-time alert updates (polling-based)
   */
  _subscribeToAlerts(farmerId, callback) {
    const channelName = `alerts_${farmerId}`;
    
    if (this.subscriptions[channelName]) {
      return;
    }

    // Polling for price alerts
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `${this.url}/rest/v1/price_alerts?farmer_id=eq.${farmerId}`,
          { headers: this.headers }
        );

        if (response.ok) {
          const alerts = await response.json();
          if (callback) {
            callback(alerts);
          }
        }
      } catch (error) {
        console.error(`Alerts polling error:`, error.message);
      }
    }, 15000); // Poll every 15 seconds

    this.subscriptions[channelName] = pollInterval;
    console.log(`📡 Real-time subscription active: alerts for ${farmerId} (polling 15s)`);
  }

  /**
   * Delete price alert
   */
  async deletePriceAlert(alertId) {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/price_alerts?id=eq.${alertId}`,
        {
          method: 'DELETE',
          headers: this.headers,
        }
      );

      if (response.status === 204) {
        console.log(`✅ Alert deleted: ${alertId}`);
        return { status: 'deleted', alert_id: alertId };
      }
    } catch (error) {
      console.error('❌ Failed to delete alert:', error.message);
    }
    return null;
  }

  /**
   * ─── PRICE HISTORY (Real-time) ──────────────────────
   */

  /**
   * Save price history entry
   */
  async savePriceHistory(historyData) {
    try {
      const response = await fetch(`${this.url}/rest/v1/price_history`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          crop: historyData.crop,
          price: historyData.price,
          market: historyData.market,
          date: historyData.date || new Date().toISOString(),
        }),
      });

      if (response.ok) {
        console.log(`✅ History saved: ${historyData.crop}`);
        return await response.json();
      }
    } catch (error) {
      console.error('❌ Failed to save price history:', error.message);
    }
    return null;
  }

  /**
   * Get price history for a crop (Real-time)
   */
  async getPriceHistory(crop, days = 7, callback) {
    try {
      const sevenDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // First fetch current history
      const response = await fetch(
        `${this.url}/rest/v1/price_history?crop=eq.${crop}&date=gte.${sevenDaysAgo.toISOString()}&order=date.desc`,
        { headers: this.headers }
      );

      if (response.ok) {
        const history = await response.json();
        
        // Return current history immediately
        if (callback) {
          callback(history);
        }
        
        // Set up real-time listener
        this._subscribeToPriceHistory(crop, callback);
        
        return history;
      }
    } catch (error) {
      console.error(`❌ Failed to fetch price history:`, error.message);
    }
    return [];
  }

  /**
   * Subscribe to real-time price history updates (polling-based)
   */
  _subscribeToPriceHistory(crop, callback) {
    const channelName = `history_${crop}`;
    
    if (this.subscriptions[channelName]) {
      return;
    }

    // Polling for price history
    const pollInterval = setInterval(async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const response = await fetch(
          `${this.url}/rest/v1/price_history?crop=eq.${crop}&date=gte.${sevenDaysAgo.toISOString()}&order=date.desc`,
          { headers: this.headers }
        );

        if (response.ok) {
          const history = await response.json();
          if (callback) {
            callback(history);
          }
        }
      } catch (error) {
        console.error(`History polling error:`, error.message);
      }
    }, 20000); // Poll every 20 seconds

    this.subscriptions[channelName] = pollInterval;
    console.log(`📡 Real-time subscription active: history for ${crop} (polling 20s)`);
  }

  /**
   * ─── CLEANUP ─────────────────────────────────────────
   */

  /**
   * Unsubscribe from all real-time updates
   */
  unsubscribeAll() {
    Object.values(this.subscriptions).forEach(interval => clearInterval(interval));
    this.subscriptions = {};
    console.log('🧹 All real-time subscriptions cleared');
  }

  /**
   * Check if connected to Supabase
   */
  async checkConnectivity() {
    try {
      const response = await fetch(
        `${this.url}/rest/v1/market_prices?limit=1`,
        { headers: this.headers }
      );
      
      if (response.ok) {
        console.log('✅ Supabase connected!');
        return true;
      }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error.message);
    }
    return false;
  }
}

export default new SupabaseRealtimeService();
