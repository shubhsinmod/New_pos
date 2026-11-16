package com.example.pos.delivery.aggregator;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "aggregator")
public class AggregatorConfig {

    /**
     * Mode: SIMULATION (safe offline test) or LIVE (real HTTP calls to Swiggy/Zomato servers)
     */
    private String mode = "SIMULATION";

    private boolean autoAccept = false;
    private int defaultPrepTime = 15;

    // Zomato Partner API Settings
    private String zomatoBaseUrl = "https://api.zomato.com/v1";
    private String zomatoApiKey = "YOUR_ZOMATO_API_KEY_HERE";
    private String zomatoSecret = "YOUR_ZOMATO_SECRET_KEY_HERE";
    private String zomatoStoreId = "YOUR_ZOMATO_STORE_ID_HERE";

    // Swiggy Partner API Settings
    private String swiggyBaseUrl = "https://partner-api.swiggy.com/v1";
    private String swiggyApiKey = "YOUR_SWIGGY_API_KEY_HERE";
    private String swiggySecret = "YOUR_SWIGGY_SECRET_KEY_HERE";
    private String swiggyRestaurantId = "YOUR_SWIGGY_REST_ID_HERE";

    public AggregatorConfig() {}

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public boolean isAutoAccept() { return autoAccept; }
    public void setAutoAccept(boolean autoAccept) { this.autoAccept = autoAccept; }

    public int getDefaultPrepTime() { return defaultPrepTime; }
    public void setDefaultPrepTime(int defaultPrepTime) { this.defaultPrepTime = defaultPrepTime; }

    public String getZomatoBaseUrl() { return zomatoBaseUrl; }
    public void setZomatoBaseUrl(String zomatoBaseUrl) { this.zomatoBaseUrl = zomatoBaseUrl; }

    public String getZomatoApiKey() { return zomatoApiKey; }
    public void setZomatoApiKey(String zomatoApiKey) { this.zomatoApiKey = zomatoApiKey; }

    public String getZomatoSecret() { return zomatoSecret; }
    public void setZomatoSecret(String zomatoSecret) { this.zomatoSecret = zomatoSecret; }

    public String getZomatoStoreId() { return zomatoStoreId; }
    public void setZomatoStoreId(String zomatoStoreId) { this.zomatoStoreId = zomatoStoreId; }

    public String getSwiggyBaseUrl() { return swiggyBaseUrl; }
    public void setSwiggyBaseUrl(String swiggyBaseUrl) { this.swiggyBaseUrl = swiggyBaseUrl; }

    public String getSwiggyApiKey() { return swiggyApiKey; }
    public void setSwiggyApiKey(String swiggyApiKey) { this.swiggyApiKey = swiggyApiKey; }

    public String getSwiggySecret() { return swiggySecret; }
    public void setSwiggySecret(String swiggySecret) { this.swiggySecret = swiggySecret; }

    public String getSwiggyRestaurantId() { return swiggyRestaurantId; }
    public void setSwiggyRestaurantId(String swiggyRestaurantId) { this.swiggyRestaurantId = swiggyRestaurantId; }

    public boolean isLive() {
        return "LIVE".equalsIgnoreCase(mode);
    }
}
