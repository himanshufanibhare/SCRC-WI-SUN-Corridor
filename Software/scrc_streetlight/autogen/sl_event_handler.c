#include "sl_event_handler.h"

#include "em_chip.h"
#include "sl_interrupt_manager.h"
#include "sl_board_init.h"
#include "sl_device_init_dcdc.h"
#include "sl_clock_manager.h"
#include "sl_device_init_lfxo.h"
#include "sl_device_init_hfxo.h"
#include "sl_device_init_clocks.h"
#include "sl_device_init_emu.h"
#include "sl_memory_manager.h"
#include "pa_conversions_efr32.h"
#include "sl_rail_util_pti.h"
#include "sl_board_control.h"
#include "sl_sleeptimer.h"
#include "sl_debug_swo.h"
#include "sl_gpio.h"
#include "sl_iostream_init_eusart_instances.h"
#include "sl_mbedtls.h"
#include "sl_simple_led_instances.h"
#include "sl_wisun_app_core.h"
#include "sl_wisun_app_status.h"
#include "sl_wisun_coap.h"
#include "sl_wisun_event_mgr.h"
#include "sl_wisun_stack.h"
#include "psa/crypto.h"
#include "sl_se_manager.h"
#include "cpu.h"
#include "cmsis_os2.h"
#include "sl_iostream_init_instances.h"
#include "nvm3_default.h"
#include "sl_cos.h"
#include "sl_iostream_handles.h"
#include "sl_rail_util_rf_path_switch.h"

void sl_platform_init(void)
{
  CHIP_Init();
  sl_interrupt_manager_init();
  sl_board_preinit();
  sl_device_init_dcdc();
  sl_clock_manager_runtime_init();
  sl_device_init_lfxo();
  sl_device_init_hfxo();
  sl_device_init_clocks();
  sl_device_init_emu();
  sl_memory_init();
  sl_board_init();
  CPU_Init();
  osKernelInitialize();
  nvm3_initDefault();
}

void sl_kernel_start(void)
{
  osKernelStart();
}

void sl_driver_init(void)
{
  sl_debug_swo_init();
  sl_gpio_init();
  sl_simple_led_init_instances();
  sl_cos_send_config();
}

void sl_service_init(void)
{
  sl_board_configure_vcom();
  sl_sleeptimer_init();
  sl_mbedtls_init();
  psa_crypto_init();
  sl_se_init();
  sl_iostream_init_instances_stage_1();
  sl_iostream_init_instances_stage_2();
}

void sl_stack_init(void)
{
  sl_rail_util_pa_init();
  sl_rail_util_pti_init();
  sl_wisun_coap_init_default();
  sl_wisun_stack_init();
  sl_rail_util_rf_path_switch_init();
}

void sl_internal_app_init(void)
{
  sl_wisun_app_core_init();
  sl_wisun_app_status_init();
  app_wisun_event_mgr_init();
}

void sl_iostream_init_instances_stage_1(void)
{
  sl_iostream_eusart_init_instances();
}

void sl_iostream_init_instances_stage_2(void)
{
  sl_iostream_set_console_instance();
}

