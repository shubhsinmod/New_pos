package com.example.pos.outlet;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record OutletRequest(
    @NotBlank @Size(max = 150) String name,
    @NotBlank @Size(max = 30) String code,
    @Size(max = 30) String phone,
    @Email @Size(max = 150) String email,
    String address,
    @Size(max = 15) String gstin,
    Boolean active
) {}
