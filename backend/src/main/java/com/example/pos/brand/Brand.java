package com.example.pos.brand;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "brands")
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "corporate_email", length = 100)
    private String corporateEmail;

    @Column(name = "corporate_phone", length = 30)
    private String corporatePhone;

    @Column(length = 50)
    private String gstin;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = OffsetDateTime.now();
    }

    public Brand() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getCorporateEmail() { return corporateEmail; }
    public void setCorporateEmail(String corporateEmail) { this.corporateEmail = corporateEmail; }

    public String getCorporatePhone() { return corporatePhone; }
    public void setCorporatePhone(String corporatePhone) { this.corporatePhone = corporatePhone; }

    public String getGstin() { return gstin; }
    public void setGstin(String gstin) { this.gstin = gstin; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}
