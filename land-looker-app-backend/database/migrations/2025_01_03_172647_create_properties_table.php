<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->integer('size');
            $table->enum('property_type', ['house', 'apartment', 'villa'])->default('house'); 
            $table->integer('bedrooms');
            $table->integer('bathrooms');
            $table->integer('year_built')->nullable();
            $table->date('available_from')->nullable();
            $table->enum('status', ['available', 'sold', 'reserved'])->default('available'); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};
