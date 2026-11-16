package com.example.pos.delivery.aggregator;

import com.example.pos.customer.Customer;
import com.example.pos.customer.CustomerRepository;
import com.example.pos.delivery.OnlineDeliveryOrder;
import com.example.pos.delivery.OnlineDeliveryOrderRepository;
import com.example.pos.kitchen.KitchenOrder;
import com.example.pos.kitchen.KitchenOrderRepository;
import com.example.pos.order.RestaurantOrder;
import com.example.pos.order.RestaurantOrderRepository;
import com.example.pos.outlet.Outlet;
import com.example.pos.outlet.OutletRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/webhooks")
@CrossOrigin(origins = "*")
public class AggregatorWebhookController {

    private static final Logger log = LoggerFactory.getLogger(AggregatorWebhookController.class);

    private final OnlineDeliveryOrderRepository deliveryRepository;
    private final RestaurantOrderRepository orderRepository;
    private final KitchenOrderRepository kitchenOrderRepository;
    private final CustomerRepository customerRepository;
    private final OutletRepository outletRepository;
    private final AggregatorConfig config;
    private final AggregatorClientService clientService;
    private final ObjectMapper objectMapper;

    public AggregatorWebhookController(
            OnlineDeliveryOrderRepository deliveryRepository,
            RestaurantOrderRepository orderRepository,
            KitchenOrderRepository kitchenOrderRepository,
            CustomerRepository customerRepository,
            OutletRepository outletRepository,
            AggregatorConfig config,
            AggregatorClientService clientService
    ) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
        this.kitchenOrderRepository = kitchenOrderRepository;
        this.customerRepository = customerRepository;
        this.outletRepository = outletRepository;
        this.config = config;
        this.clientService = clientService;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Zomato Partner Webhook
     */
    @PostMapping("/zomato")
    public ResponseEntity<Map<String, Object>> handleZomatoWebhook(
            @RequestHeader(value = "X-Zomato-Signature", required = false) String signature,
            @RequestBody Map<String, Object> payload
    ) {
        log.info("[WEBHOOK] Received Zomato webhook payload: {}", payload);
        return processIncomingOrder("Zomato", payload);
    }

    /**
     * Swiggy Partner Webhook
     */
    @PostMapping("/swiggy")
    public ResponseEntity<Map<String, Object>> handleSwiggyWebhook(
            @RequestHeader(value = "X-Swiggy-Hmac-SHA256", required = false) String signature,
            @RequestBody Map<String, Object> payload
    ) {
        log.info("[WEBHOOK] Received Swiggy webhook payload: {}", payload);
        return processIncomingOrder("Swiggy", payload);
    }

    /**
     * UrbanPiper Unified Relay Webhook (Zomato + Swiggy + ONDC in one pipeline)
     */
    @PostMapping("/urbanpiper")
    public ResponseEntity<Map<String, Object>> handleUrbanpiperWebhook(
            @RequestBody Map<String, Object> payload
    ) {
        log.info("[WEBHOOK] Received UrbanPiper relay payload");
        String platform = "Online Delivery";
        if (payload.containsKey("channel")) {
            platform = String.valueOf(payload.get("channel"));
        }
        return processIncomingOrder(platform, payload);
    }

    /**
     * Quick Simulation endpoint for POS testing
     * POST /api/webhooks/simulate?platform=Zomato&outletId=1
     */
    @PostMapping(value = "/simulate")
    public ResponseEntity<Map<String, Object>> simulateOrder(
            @RequestParam(defaultValue = "Zomato") String platform,
            @RequestParam(defaultValue = "1") Long outletId,
            @RequestBody(required = false) Map<String, Object> customPayload
    ) {
        int randomId = 1000 + (int)(Math.random() * 9000);
        String prefix = platform.toUpperCase().startsWith("SW") ? "SWG" : "ZOM";
        String orderNumber = prefix + "-" + randomId;

        OnlineDeliveryOrder order = new OnlineDeliveryOrder();
        order.setPlatform(platform.substring(0, 1).toUpperCase() + platform.substring(1).toLowerCase());
        order.setOrderNumber(orderNumber);

        // Sample customer & dishes
        if (customPayload != null && customPayload.containsKey("customerName")) {
            order.setCustomerName(String.valueOf(customPayload.get("customerName")));
            order.setCustomerPhone(String.valueOf(customPayload.getOrDefault("customerPhone", "+91 98765 00000")));
            order.setDeliveryAddress(String.valueOf(customPayload.getOrDefault("deliveryAddress", "12th Cross, Indiranagar, Bengaluru")));
            order.setTotalAmount(Double.valueOf(String.valueOf(customPayload.getOrDefault("totalAmount", 480.0))));
            order.setSubtotal(Double.valueOf(String.valueOf(customPayload.getOrDefault("subtotal", 420.0))));
            order.setTax(Double.valueOf(String.valueOf(customPayload.getOrDefault("tax", 21.0))));
            order.setDeliveryCharges(Double.valueOf(String.valueOf(customPayload.getOrDefault("deliveryCharges", 30.0))));
            order.setPackagingCharges(Double.valueOf(String.valueOf(customPayload.getOrDefault("packagingCharges", 20.0))));
            order.setInstructions(String.valueOf(customPayload.getOrDefault("instructions", "Leave at door, ring bell once.")));
            order.setItemsJson(String.valueOf(customPayload.getOrDefault("itemsJson",
                    "[{\"name\":\"Butter Chicken Gravy\",\"qty\":1,\"price\":360},{\"name\":\"Butter Garlic Naan\",\"qty\":2,\"price\":65}]")));
        } else {
            order.setCustomerName(platform.equalsIgnoreCase("Swiggy") ? "Pooja Hegde" : "Vikram Malhotra");
            order.setCustomerPhone(platform.equalsIgnoreCase("Swiggy") ? "+91 98450 77881" : "+91 99201 55442");
            order.setDeliveryAddress("Tower B, Flat 402, Green Glen Layout, Bengaluru - 560103");
            order.setItemsJson("[{\"name\":\"Paneer Butter Masala\",\"qty\":1,\"price\":290},{\"name\":\"Butter Garlic Naan\",\"qty\":2,\"price\":65}]");
            order.setSubtotal(420.0);
            order.setTax(21.0);
            order.setDeliveryCharges(35.0);
            order.setPackagingCharges(25.0);
            order.setTotalAmount(501.0);
            order.setInstructions("Please deliver hot. Contactless delivery.");
        }

        order.setRiderName(platform.equalsIgnoreCase("Swiggy") ? "Suresh Kumar" : "Ramesh Naik");
        order.setRiderPhone("+91 91234 56789");
        order.setRiderEta("12 mins");
        order.setPrepTimeMinutes(config.getDefaultPrepTime());
        order.setStatus(config.isAutoAccept() ? "In Kitchen" : "Pending Acceptance");

        Long targetOutletId = outletId;
        if (customPayload != null && (customPayload.containsKey("store_id") || customPayload.containsKey("storeId"))) {
            String storeRef = String.valueOf(customPayload.getOrDefault("store_id", customPayload.get("storeId"))).trim();
            targetOutletId = outletRepository.findAll().stream()
                    .filter(o -> (o.getZomatoStoreId() != null && o.getZomatoStoreId().equalsIgnoreCase(storeRef))
                            || (o.getSwiggyStoreId() != null && o.getSwiggyStoreId().equalsIgnoreCase(storeRef))
                            || (o.getCode() != null && o.getCode().equalsIgnoreCase(storeRef))
                            || String.valueOf(o.getId()).equals(storeRef))
                    .map(Outlet::getId)
                    .findFirst()
                    .orElse(outletId);
        }
        order.setOutletId(targetOutletId);
        order.setCreatedAt(OffsetDateTime.now());

        OnlineDeliveryOrder saved = deliveryRepository.save(order);
        syncCustomer(saved);

        if (config.isAutoAccept()) {
            dispatchKitchenKot(saved);
            clientService.acceptOrder(saved, saved.getPrepTimeMinutes());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Simulated " + platform + " order injected successfully!");
        response.put("order", saved);
        return ResponseEntity.ok(response);
    }

    private ResponseEntity<Map<String, Object>> processIncomingOrder(String platform, Map<String, Object> payload) {
        try {
            OnlineDeliveryOrder order = new OnlineDeliveryOrder();
            order.setPlatform(platform);

            String rawOrderNumber = payload.containsKey("order_id") ? String.valueOf(payload.get("order_id"))
                    : payload.containsKey("orderNumber") ? String.valueOf(payload.get("orderNumber"))
                    : (platform.substring(0, 3).toUpperCase() + "-" + (1000 + (int)(Math.random() * 9000)));
            order.setOrderNumber(rawOrderNumber);

            // Parse Customer info
            if (payload.containsKey("customer")) {
                Map<?, ?> cust = (Map<?, ?>) payload.get("customer");
                order.setCustomerName(cust.get("name") != null ? cust.get("name").toString() : "Online Guest");
                order.setCustomerPhone(cust.get("phone") != null ? cust.get("phone").toString() : "");
                order.setDeliveryAddress(cust.get("address") != null ? cust.get("address").toString() : "Delivery address on app");
            } else {
                order.setCustomerName(payload.getOrDefault("customerName", "Online Customer").toString());
                order.setCustomerPhone(payload.getOrDefault("customerPhone", "").toString());
                order.setDeliveryAddress(payload.getOrDefault("deliveryAddress", "Delivery address on app").toString());
            }

            // Financial breakdown
            order.setSubtotal(parseDouble(payload.getOrDefault("subtotal", 0.0)));
            order.setTax(parseDouble(payload.getOrDefault("tax", 0.0)));
            order.setDeliveryCharges(parseDouble(payload.getOrDefault("delivery_charges", payload.getOrDefault("deliveryCharges", 0.0))));
            order.setPackagingCharges(parseDouble(payload.getOrDefault("packaging_charges", payload.getOrDefault("packagingCharges", 0.0))));
            order.setTotalAmount(parseDouble(payload.getOrDefault("total", payload.getOrDefault("totalAmount", order.getSubtotal() + order.getTax()))));

            // Items
            if (payload.containsKey("items")) {
                order.setItemsJson(objectMapper.writeValueAsString(payload.get("items")));
            } else {
                order.setItemsJson(payload.getOrDefault("itemsJson", "[]").toString());
            }

            // Instructions & Rider details
            order.setInstructions(payload.getOrDefault("instructions", "").toString());
            if (payload.containsKey("rider")) {
                Map<?, ?> rider = (Map<?, ?>) payload.get("rider");
                order.setRiderName(rider.get("name") != null ? rider.get("name").toString() : null);
                order.setRiderPhone(rider.get("phone") != null ? rider.get("phone").toString() : null);
                order.setRiderEta(rider.get("eta") != null ? rider.get("eta").toString() : "15 mins");
            }

            order.setPrepTimeMinutes(config.getDefaultPrepTime());
            order.setStatus(config.isAutoAccept() ? "In Kitchen" : "Pending Acceptance");

            // Outlet ID resolution (Matches Zomato store_id / res_id with outlet code)
            Long resolvedOutletId = 1L;
            if (payload.containsKey("outletId")) {
                try { resolvedOutletId = Long.parseLong(payload.get("outletId").toString()); } catch (Exception ignored) {}
            } else if (payload.containsKey("store_id") || payload.containsKey("storeId") || payload.containsKey("res_id") || payload.containsKey("restaurant_id")) {
                String storeRef = String.valueOf(payload.getOrDefault("store_id", payload.getOrDefault("storeId", payload.getOrDefault("res_id", payload.get("restaurant_id"))))).trim();
                resolvedOutletId = outletRepository.findAll().stream()
                        .filter(o -> (o.getZomatoStoreId() != null && o.getZomatoStoreId().equalsIgnoreCase(storeRef))
                                || (o.getSwiggyStoreId() != null && o.getSwiggyStoreId().equalsIgnoreCase(storeRef))
                                || (o.getCode() != null && o.getCode().equalsIgnoreCase(storeRef))
                                || String.valueOf(o.getId()).equals(storeRef))
                        .map(Outlet::getId)
                        .findFirst()
                        .orElse(1L);
            } else {
                resolvedOutletId = outletRepository.findAll().stream().map(Outlet::getId).findFirst().orElse(1L);
            }
            order.setOutletId(resolvedOutletId);
            order.setCreatedAt(OffsetDateTime.now());

            OnlineDeliveryOrder saved = deliveryRepository.save(order);
            syncCustomer(saved);

            if (config.isAutoAccept()) {
                dispatchKitchenKot(saved);
                clientService.acceptOrder(saved, saved.getPrepTimeMinutes());
            }

            Map<String, Object> ack = new HashMap<>();
            ack.put("status", "ACKNOWLEDGED");
            ack.put("order_id", saved.getOrderNumber());
            ack.put("timestamp", OffsetDateTime.now().toString());
            return ResponseEntity.ok(ack);

        } catch (Exception e) {
            log.error("[WEBHOOK ERROR] Failed to process order payload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "ERROR", "message", e.getMessage()));
        }
    }

    private void syncCustomer(OnlineDeliveryOrder order) {
        try {
            String phone = order.getCustomerPhone();
            String name = order.getCustomerName();
            if (phone == null || phone.isBlank()) return;

            Customer customer = customerRepository.findByPhone(phone).orElseGet(() -> {
                Customer c = new Customer();
                c.setPhone(phone);
                c.setName(name);
                c.setVisits(0);
                c.setTotalSpent(0.0);
                c.setLoyaltyPoints(0);
                c.setOutletId(order.getOutletId());
                return c;
            });

            customer.setVisits((customer.getVisits() != null ? customer.getVisits() : 0) + 1);
            double spend = order.getTotalAmount() != null ? order.getTotalAmount() : 0.0;
            customer.setTotalSpent((customer.getTotalSpent() != null ? customer.getTotalSpent() : 0.0) + spend);
            customer.setLoyaltyPoints((customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0) + (int)(spend / 10));
            customerRepository.save(customer);
        } catch (Exception ignored) {}
    }

    private void dispatchKitchenKot(OnlineDeliveryOrder order) {
        try {
            KitchenOrder ko = new KitchenOrder();
            ko.setKotNumber(order.getOrderNumber());
            ko.setOrderNumber(order.getOrderNumber());
            String numOnly = order.getOrderNumber().replaceAll("[^0-9]", "");
            ko.setTableCode(order.getPlatform() + " #" + (numOnly.isBlank() ? order.getId() : numOnly));
            ko.setOrderType("Delivery");
            ko.setStatus("In Kitchen");
            ko.setItemsJson(order.getItemsJson());
            ko.setNotes("[" + order.getPlatform().toUpperCase() + "] " + order.getDeliveryAddress() +
                    (order.getRiderName() != null ? " | Rider: " + order.getRiderName() : "") +
                    (order.getInstructions() != null ? " | " + order.getInstructions() : ""));
            ko.setStation("Main Kitchen");
            ko.setPrepTimeMinutes(order.getPrepTimeMinutes() != null ? order.getPrepTimeMinutes() : 15);
            ko.setOutletId(order.getOutletId());
            kitchenOrderRepository.save(ko);
        } catch (Exception ignored) {}
    }

    private Double parseDouble(Object val) {
        if (val == null) return 0.0;
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }
}
