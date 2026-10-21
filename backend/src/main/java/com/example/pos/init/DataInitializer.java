package com.example.pos.init;

import com.example.pos.billing.Bill;
import com.example.pos.billing.BillRepository;
import com.example.pos.customer.Customer;
import com.example.pos.customer.CustomerRepository;
import com.example.pos.menu.Category;
import com.example.pos.menu.CategoryRepository;
import com.example.pos.menu.Product;
import com.example.pos.menu.ProductRepository;
import com.example.pos.order.RestaurantOrder;
import com.example.pos.order.RestaurantOrderRepository;
import com.example.pos.outlet.Outlet;
import com.example.pos.outlet.OutletRepository;
import com.example.pos.table.DiningTable;
import com.example.pos.table.DiningTableRepository;
import com.example.pos.user.User;
import com.example.pos.user.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;
    private final DiningTableRepository tableRepo;
    private final CustomerRepository customerRepo;
    private final OutletRepository outletRepo;
    private final RestaurantOrderRepository orderRepo;
    private final BillRepository billRepo;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CategoryRepository categoryRepo,
                           ProductRepository productRepo,
                           DiningTableRepository tableRepo,
                           CustomerRepository customerRepo,
                           OutletRepository outletRepo,
                           RestaurantOrderRepository orderRepo,
                           BillRepository billRepo,
                           UserRepository userRepo,
                           PasswordEncoder passwordEncoder) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
        this.tableRepo = tableRepo;
        this.customerRepo = customerRepo;
        this.outletRepo = outletRepo;
        this.orderRepo = orderRepo;
        this.billRepo = billRepo;
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedOutlets();
        seedCategories();
        seedProducts();
        seedUsers();
    }

    private void seedOutlets() {
        if (outletRepo.count() == 0) {
            Outlet o1 = new Outlet();
            o1.setName("Bengaluru Main");
            o1.setCode("BLR-01");
            o1.setPhone("+91 98765 43210");
            o1.setEmail("blr@tableflow.com");
            o1.setAddress("Indiranagar 100ft Road, Bengaluru, Karnataka");
            o1.setGstin("29ABCDE1234F1Z5");
            o1.setActive(true);
            outletRepo.save(o1);

            Outlet o2 = new Outlet();
            o2.setName("Pune Central");
            o2.setCode("PUN-01");
            o2.setPhone("+91 98765 43211");
            o2.setEmail("pune@tableflow.com");
            o2.setAddress("Koregaon Park North Main Road, Pune, Maharashtra");
            o2.setGstin("27ABCDE1234F1Z3");
            o2.setActive(true);
            outletRepo.save(o2);

            Outlet o3 = new Outlet();
            o3.setName("Mumbai Express");
            o3.setCode("MUM-01");
            o3.setPhone("+91 98765 43212");
            o3.setEmail("mumbai@tableflow.com");
            o3.setAddress("Pali Hill, Bandra West, Mumbai, Maharashtra");
            o3.setGstin("27ABCDE1234F1Z4");
            o3.setActive(true);
            outletRepo.save(o3);
        }
    }

    private void seedCategories() {
        if (categoryRepo.count() == 0) {
            categoryRepo.saveAll(List.of(
                    new Category("Starters", "STARTERS", 1),
                    new Category("Main Course", "MAIN_COURSE", 2),
                    new Category("Biryani & Rice", "BIRYANI", 3),
                    new Category("Breads", "BREADS", 4),
                    new Category("Beverages", "BEVERAGES", 5),
                    new Category("Desserts", "DESSERTS", 6)
            ));
        }
    }

    private void seedProducts() {
        if (productRepo.count() == 0) {
            productRepo.saveAll(List.of(
                    new Product("Paneer Butter Masala", "Main Course", 290.0, true, true, "Cottage cheese cubes simmered in rich creamy tomato gravy"),
                    new Product("Butter Chicken Gravy", "Main Course", 360.0, false, true, "Tender tandoori chicken cooked in classic makhani sauce"),
                    new Product("Dal Makhani Gold", "Main Course", 240.0, true, true, "Slow cooked black lentils with fresh cream & white butter"),
                    new Product("Hyderabadi Chicken Biryani", "Biryani & Rice", 340.0, false, true, "Dum cooked basmati rice with marinated chicken & aromatic spices"),
                    new Product("Veg Dum Biryani Royal", "Biryani & Rice", 260.0, true, true, "Fragrant basmati rice layered with garden fresh vegetables"),
                    new Product("Crispy Corn & Water Chestnut", "Starters", 220.0, true, true, "Tossed in wok with pepper, spring onions and schezwan spice"),
                    new Product("Tandoori Murgh (Half)", "Starters", 320.0, false, true, "Whole bone chicken marinated in red curd marinade and roasted"),
                    new Product("Paneer Tikka Sunhari", "Starters", 270.0, true, true, "Clay oven roasted paneer cubes with bell peppers"),
                    new Product("Butter Garlic Naan", "Breads", 65.0, true, true, "Tandoor leavened refined bread brushed with garlic butter"),
                    new Product("Laccha Paratha", "Breads", 55.0, true, true, "Crisp multi-layered whole wheat tandoori paratha"),
                    new Product("Cold Brew Iced Coffee", "Beverages", 160.0, true, true, "Rich espresso blended with chilled milk and chocolate froth"),
                    new Product("Fresh Mint Lime Soda", "Beverages", 90.0, true, true, "Crushed sweet mint, freshly squeezed lime, and chilled soda"),
                    new Product("Hot Gulab Jamun (2 pcs)", "Desserts", 110.0, true, true, "Soft khoya dumplings dipped in saffron cardamom syrup"),
                    new Product("Sizzling Brownie with Ice Cream", "Desserts", 210.0, true, true, "Warm fudge walnut brownie with vanilla bean gelato")
            ));
        }
    }

    private void seedTables() {
        Long defaultOutletId = outletRepo.findAll().stream().findFirst().map(Outlet::getId).orElse(1L);
        if (tableRepo.count() == 0) {
            List<DiningTable> initialTables = List.of(
                    new DiningTable("T-01", "Table 1", "Main Dining", 4, "Available", 0.0, null),
                    new DiningTable("T-02", "Table 2", "Main Dining", 2, "Occupied", 650.0, "24 mins ago"),
                    new DiningTable("T-03", "Table 3", "Main Dining", 6, "Available", 0.0, null),
                    new DiningTable("T-04", "Table 4", "Main Dining", 4, "Billed", 1240.0, "45 mins ago"),
                    new DiningTable("AC-01", "AC Hall 1", "AC Family Hall", 6, "Available", 0.0, null),
                    new DiningTable("AC-02", "AC Hall 2", "AC Family Hall", 8, "Reserved", 0.0, "Reserved 8:30 PM"),
                    new DiningTable("AC-03", "AC Hall 3", "AC Family Hall", 4, "Occupied", 890.0, "12 mins ago"),
                    new DiningTable("RT-01", "Terrace 1", "Rooftop Terrace", 2, "Occupied", 410.0, "18 mins ago"),
                    new DiningTable("RT-02", "Terrace 2", "Rooftop Terrace", 4, "Available", 0.0, null),
                    new DiningTable("BAR-01", "Bar High 1", "Bar Lounge", 2, "Available", 0.0, null),
                    new DiningTable("BAR-02", "Bar High 2", "Bar Lounge", 2, "Available", 0.0, null)
            );
            initialTables.forEach(t -> t.setOutletId(defaultOutletId));
            tableRepo.saveAll(initialTables);
        } else {
            // Automatically backfill any existing tables where outlet_id is NULL
            List<DiningTable> existing = tableRepo.findAll();
            boolean needsUpdate = false;
            for (DiningTable t : existing) {
                if (t.getOutletId() == null) {
                    t.setOutletId(defaultOutletId);
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                tableRepo.saveAll(existing);
            }
        }
    }

    private void seedCustomers() {
        if (customerRepo.count() == 0) {
            customerRepo.saveAll(List.of(
                    new Customer("Rahul Verma", "+91 98451 12345", 14, 18450.0, 520),
                    new Customer("Priya Nair", "+91 97410 98765", 8, 9600.0, 280),
                    new Customer("Amitabh Sen", "+91 99001 22334", 22, 34100.0, 1040),
                    new Customer("Sneha Kulkarni", "+91 91234 56789", 5, 4800.0, 140)
            ));
        }
    }

    private void seedOrdersAndBills() {
        if (orderRepo.count() == 0) {
            RestaurantOrder o1 = new RestaurantOrder();
            o1.setOrderNumber("ORD-104");
            o1.setTableCode("RT-01");
            o1.setOrderType("Dine-In");
            o1.setStatus("In Kitchen");
            o1.setItemsJson("[{\"name\":\"Cold Brew Iced Coffee\",\"qty\":2},{\"name\":\"Crispy Corn & Water Chestnut\",\"qty\":1}]");
            o1.setSubtotal(410.0);
            o1.setTotal(430.0);
            o1.setNotes("Less ice in coffee");
            orderRepo.save(o1);

            RestaurantOrder o2 = new RestaurantOrder();
            o2.setOrderNumber("ORD-103");
            o2.setTableCode("AC-03");
            o2.setOrderType("Dine-In");
            o2.setStatus("Preparing");
            o2.setItemsJson("[{\"name\":\"Paneer Butter Masala\",\"qty\":1},{\"name\":\"Butter Garlic Naan\",\"qty\":4}]");
            o2.setSubtotal(550.0);
            o2.setTotal(577.0);
            o2.setNotes("Medium spicy");
            orderRepo.save(o2);
        }

        if (billRepo.count() == 0) {
            Bill b1 = new Bill();
            b1.setBillNumber("BILL-9024");
            b1.setOrderNumber("ORD-098");
            b1.setTableCode("T-04");
            b1.setOrderType("Dine-In");
            b1.setCustomerName("Rahul Verma");
            b1.setCustomerPhone("+91 98451 12345");
            b1.setItemsCount(4);
            b1.setSubtotal(1180.0);
            b1.setDiscount(0.0);
            b1.setTax(60.0);
            b1.setTotal(1240.0);
            b1.setPaymentMode("UPI");
            b1.setStatus("PAID");
            b1.setOutletName("Bengaluru Main");
            b1.setOutletAddress("Indiranagar 100ft Road, Bengaluru, Karnataka");
            b1.setGstin("29ABCDE1234F1Z5");
            b1.setItemsJson("[{\"name\":\"Paneer Butter Masala\",\"qty\":2,\"price\":290},{\"name\":\"Butter Garlic Naan\",\"qty\":6,\"price\":65}]");
            billRepo.save(b1);

            Bill b2 = new Bill();
            b2.setBillNumber("BILL-9023");
            b2.setOrderNumber("ORD-095");
            b2.setTableCode("T-01");
            b2.setOrderType("Dine-In");
            b2.setCustomerName("Walk-in Guest");
            b2.setItemsCount(3);
            b2.setSubtotal(620.0);
            b2.setDiscount(0.0);
            b2.setTax(30.0);
            b2.setTotal(650.0);
            b2.setPaymentMode("CASH");
            b2.setStatus("PAID");
            b2.setOutletName("Bengaluru Main");
            b2.setOutletAddress("Indiranagar 100ft Road, Bengaluru, Karnataka");
            b2.setGstin("29ABCDE1234F1Z5");
            b2.setItemsJson("[{\"name\":\"Hyderabadi Chicken Biryani\",\"qty\":1,\"price\":340},{\"name\":\"Cold Brew Iced Coffee\",\"qty\":1,\"price\":160}]");
            billRepo.save(b2);
        }
    }

    private void seedUsers() {
        if (!userRepo.existsByUsername("superadmin")) {
            userRepo.save(new User("superadmin", passwordEncoder.encode("admin123"), "Super Administrator (Global)", "SUPER_ADMIN", null, "All Outlets (Global)"));
        }
    }
}
