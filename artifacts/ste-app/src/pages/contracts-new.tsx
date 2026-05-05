import { useState } from "react";
import { useLocation } from "wouter";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  useCreateContract,
  useListCustomers,
  getListCustomersQueryKey,
  CreateContractBodyServiceType
} from "@workspace/api-client-react";

const formSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  serviceType: z.nativeEnum(CreateContractBodyServiceType),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().optional(),
  totalValue: z.coerce.number().min(0, "Value cannot be negative"),
  paymentMethod: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  estimatedEndDate: z.string().optional(),
  warrantyPeriod: z.coerce.number().optional(),
});

export default function ContractNew() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: customers, isLoading: loadingCustomers } = useListCustomers(
    {},
    { query: { queryKey: getListCustomersQueryKey() } }
  );
  
  const createContract = useCreateContract();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: 0,
      serviceType: "hitachi",
      title: "",
      description: "",
      totalValue: 0,
      paymentMethod: "transfer",
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: "",
      warrantyPeriod: 30,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createContract.mutate({ data: values }, {
      onSuccess: (contract) => {
        toast({
          title: "Contract Created",
          description: `Contract ${contract.contractNumber} created successfully.`,
        });
        setLocation(`/contracts/${contract.id}`);
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create contract. Please try again.",
        });
        console.error(error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader 
        title="New Contract" 
        description="Draft a new service agreement or transaction contract."
      />

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer</FormLabel>
                      <Select 
                        onValueChange={(val) => field.onChange(Number(val))} 
                        value={field.value ? field.value.toString() : ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingCustomers ? "Loading..." : "Select customer"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers?.map((c) => (
                            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hitachi">Hitachi</SelectItem>
                          <SelectItem value="electrolux">Electrolux</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contract Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Instalasi Jaringan Kantor 10 Titik" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scope of Work / Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of services provided..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Value (IDR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreed Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tunai">Tunai</SelectItem>
                          <SelectItem value="qris">QRIS</SelectItem>
                          <SelectItem value="transfer">Transfer Bank</SelectItem>
                          <SelectItem value="kartu">Kartu</SelectItem>
                          <SelectItem value="cicilan">Cicilan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="warrantyPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation("/contracts")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createContract.isPending}>
                  {createContract.isPending ? "Creating..." : "Create Draft"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
