package com.stardustbi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BI智能分析平台启动类
 * 
 * @author Auto Report Team
 * @version 1.0.0
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
public class AutoReportApplication {

    public static void main(String[] args) {
        SpringApplication.run(AutoReportApplication.class, args);
    }
}