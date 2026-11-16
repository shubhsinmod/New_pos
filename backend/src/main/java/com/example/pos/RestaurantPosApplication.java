package com.example.pos;

import java.security.Security;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RestaurantPosApplication {

    public static void main(String[] args) {
        // Enable TLS compatibility for local MSSQL Server instances
        Security.setProperty("jdk.tls.disabledAlgorithms",
                "SSLv3, RC4, DES, MD5withRSA, DH keySize < 1024, EC keySize < 224, 3DES_EDE_CBC, anon, NULL");

        SpringApplication.run(RestaurantPosApplication.class, args);
    }
}
